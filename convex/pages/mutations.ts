import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { invalidState, notFound } from "../lib/errors";
import {
  requirePageAccess,
  requireProjectMember,
  requireProjectEditor,
} from "../lib/permissions";
import {
  createNotification,
  getChangedLiveStateComponents,
} from "../notifications/model";
import { getAnalyticsActivityChanges } from "../pageRuntime/analytics";
import { buildProjectMemberDisplayName } from "../projects/model";
import { getOrderedProjectPages } from "../lib/projectRecords";
import { uniqueSlugFromLabel } from "../lib/slugs";
import {
  assertPageDocumentV1,
  mergePageLiveStateDocument,
} from "../../lib/pageDocument";
import {
  createInitialPage,
  parsePageDocument,
  serializePageDocument,
} from "./content";
import { getCurrentEntitlementsForUser } from "../billing/model";
import { findLimitedComponentAccessViolation } from "../../lib/pageDocument/componentAccess";

function buildProjectActorSnapshot(
  user: Parameters<typeof buildProjectMemberDisplayName>[0] & {
    image?: string | null;
  },
  membership: Parameters<typeof buildProjectMemberDisplayName>[1],
) {
  return {
    actorUserId: user._id,
    actorNameSnapshot: buildProjectMemberDisplayName(user, membership),
    actorImageSnapshot: user.image ?? null,
  };
}

export const createPage = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const now = Date.now();
    const project = await ctx.db.get(args.projectId);

    if (!project || project.isArchived) {
      throw notFound(`Project ${args.projectId} was not found.`);
    }

    await requireProjectEditor(ctx, project._id, userId);

    const existingPages = await getOrderedProjectPages(ctx, project);
    const nextPageNumber = existingPages.length + 1;
    const title = `Page ${nextPageNumber}`;
    const pageSlug = uniqueSlugFromLabel(
      title,
      existingPages.map((page) => page.slug),
      "untitled-page",
    );

    const contentJson = serializePageDocument(createInitialPage());

    const pageId = await ctx.db.insert("pages", {
      projectId: project._id,
      title,
      slug: pageSlug,
      contentJson,
      createdByUserId: userId,
      updatedByUserId: userId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(project._id, {
      pageIds: [...project.pageIds, pageId],
      updatedAt: now,
    });

    await ctx.db.patch(userId, {
      lastOpenedProjectId: project._id,
    });

    return {
      pageId,
      pageSlug,
      title,
    };
  },
});

export const renamePage = mutation({
  args: {
    pageId: v.id("pages"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const trimmedTitle = args.title.trim();

    if (!trimmedTitle) {
      throw invalidState("Page title cannot be empty.");
    }

    const page = await requirePageAccess(ctx, args.pageId, userId);
    await requireProjectEditor(ctx, page.projectId, userId);

    const project = await ctx.db.get(page.projectId);
    if (!project || project.isArchived) {
      throw notFound(`Project ${page.projectId} was not found.`);
    }

    const siblingPages = await getOrderedProjectPages(ctx, project);
    const nextSlug = uniqueSlugFromLabel(
      trimmedTitle,
      siblingPages
        .filter((siblingPage) => siblingPage._id !== page._id)
        .map((siblingPage) => siblingPage.slug),
      "untitled-page",
    );

    await ctx.db.patch(page._id, {
      title: trimmedTitle,
      slug: nextSlug,
      updatedAt: Date.now(),
      updatedByUserId: userId,
    });

    return {
      pageId: page._id,
      slug: nextSlug,
      title: trimmedTitle,
    };
  },
});

export const savePage = mutation({
  args: {
    pageId: v.id("pages"),
    title: v.string(),
    document: v.any(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const page = await requirePageAccess(ctx, args.pageId, userId);
    await requireProjectEditor(ctx, page.projectId, userId);
    const trimmedTitle = args.title.trim();

    if (!trimmedTitle) {
      throw invalidState("Page title cannot be empty.");
    }

    try {
      assertPageDocumentV1(args.document);
    } catch (error) {
      throw invalidState(
        error instanceof Error ? error.message : "Page document is invalid.",
      );
    }

    const project = await ctx.db.get(page.projectId);
    if (!project || project.isArchived) {
      throw notFound(`Project ${page.projectId} was not found.`);
    }
    const currentDocument = parsePageDocument(page.contentJson);
    const projectMembers = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (query) => query.eq("projectId", page.projectId))
      .collect();
    const activeClientUserIds = new Set<string>(
      projectMembers
        .filter(
          (membership) =>
            membership.status === "active" && membership.role === "client",
        )
        .map((membership) => String(membership.userId)),
    );
    const nextDocument = {
      ...args.document,
      components: Object.fromEntries(
        Object.entries(args.document.components).map(
          ([instanceId, component]) => {
            if (
              component.type !== "IdeaBoard" ||
              activeClientUserIds.size === 0
            ) {
              return [instanceId, component];
            }

            return [
              instanceId,
              {
                ...component,
                state: {
                  ...component.state,
                  ideas: component.state.ideas
                    .filter(
                      (idea) =>
                        component.config.canClientAdd ||
                        idea.createdByUserId === null ||
                        !activeClientUserIds.has(idea.createdByUserId),
                    )
                    .map((idea) => ({
                      ...idea,
                      votes: component.config.canClientVote
                        ? idea.votes
                        : idea.votes.filter(
                            (userId) => !activeClientUserIds.has(userId),
                          ),
                    })),
                },
              },
            ];
          },
        ),
      ),
    };
    const entitlements = await getCurrentEntitlementsForUser(ctx, userId);
    const limitedComponentViolation = findLimitedComponentAccessViolation({
      currentDocument,
      nextDocument,
      planTier: entitlements.plan.tier,
    });

    if (limitedComponentViolation) {
      throw invalidState(
        `Upgrade to Pro to use ${limitedComponentViolation.componentName}.`,
      );
    }

    const siblingPages = await getOrderedProjectPages(ctx, project);
    const nextSlug = uniqueSlugFromLabel(
      trimmedTitle,
      siblingPages
        .filter((siblingPage) => siblingPage._id !== page._id)
        .map((siblingPage) => siblingPage.slug),
      "untitled-page",
    );
    const now = Date.now();

    await ctx.db.patch(page._id, {
      title: trimmedTitle,
      slug: nextSlug,
      contentJson: serializePageDocument(nextDocument),
      updatedAt: now,
      updatedByUserId: userId,
    });

    return {
      pageId: page._id,
      slug: nextSlug,
      title: trimmedTitle,
    };
  },
});

export const savePageLiveState = mutation({
  args: {
    pageId: v.id("pages"),
    title: v.string(),
    document: v.any(),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireCurrentAuth(ctx);
    const page = await requirePageAccess(ctx, args.pageId, userId);
    const membership = await requireProjectMember(ctx, page.projectId, userId);
    const trimmedTitle = args.title.trim();

    if (!trimmedTitle) {
      throw invalidState("Page title cannot be empty.");
    }

    try {
      assertPageDocumentV1(args.document);
    } catch (error) {
      throw invalidState(
        error instanceof Error ? error.message : "Page document is invalid.",
      );
    }

    const project = await ctx.db.get(page.projectId);
    if (!project || project.isArchived) {
      throw notFound(`Project ${page.projectId} was not found.`);
    }
    const currentDocument = parsePageDocument(page.contentJson);
    const nextDocument = mergePageLiveStateDocument(
      currentDocument,
      args.document,
    );
    const shouldRenamePage = trimmedTitle !== page.title;
    let nextSlug = page.slug;

    if (shouldRenamePage) {
      await requireProjectEditor(ctx, page.projectId, userId);

      const siblingPages = await getOrderedProjectPages(ctx, project);
      nextSlug = uniqueSlugFromLabel(
        trimmedTitle,
        siblingPages
          .filter((siblingPage) => siblingPage._id !== page._id)
          .map((siblingPage) => siblingPage.slug),
        "untitled-page",
      );
    }

    const changedComponents = getChangedLiveStateComponents(
      currentDocument,
      nextDocument,
    );
    const analyticsActivityChanges = getAnalyticsActivityChanges(
      currentDocument,
      nextDocument,
    );
    type AnalyticsActivityChange = (typeof analyticsActivityChanges)[number];
    const now = Date.now();

    await ctx.db.patch(page._id, {
      title: trimmedTitle,
      slug: nextSlug,
      contentJson: serializePageDocument(nextDocument),
      updatedAt: now,
      updatedByUserId: userId,
    });

    if (analyticsActivityChanges.length > 0) {
      const actorSnapshot = buildProjectActorSnapshot(user, membership);
      const activityChangeGroups = new Map<
        string,
        {
          componentInstanceId: string;
          componentType: AnalyticsActivityChange["componentType"];
          componentLabelSnapshot: string;
          changes: AnalyticsActivityChange[];
        }
      >();
      const orderedActivityGroups: Array<{
        componentInstanceId: string;
        componentType: AnalyticsActivityChange["componentType"];
        componentLabelSnapshot: string;
        changes: AnalyticsActivityChange[];
      }> = [];

      for (const change of analyticsActivityChanges) {
        const groupKey = `${change.componentInstanceId}:${change.componentType}:${change.componentLabelSnapshot}`;
        let group = activityChangeGroups.get(groupKey);

        if (!group) {
          group = {
            componentInstanceId: change.componentInstanceId,
            componentType: change.componentType,
            componentLabelSnapshot: change.componentLabelSnapshot,
            changes: [],
          };
          activityChangeGroups.set(groupKey, group);
          orderedActivityGroups.push(group);
        }

        group.changes.push(change);
      }

      const activityWrites = orderedActivityGroups.flatMap(
        (group, groupIndex) => {
          const groupCreatedAt = now + groupIndex;
          const activityGroupId = `${page._id}:${actorSnapshot.actorUserId}:${group.componentInstanceId}:${groupCreatedAt}`;

          return group.changes.map((change, entryOrder) =>
            ctx.db.insert("projectActivity", {
              projectId: project._id,
              pageId: page._id,
              pageTitleSnapshot: trimmedTitle,
              actorUserId: actorSnapshot.actorUserId,
              actorNameSnapshot: actorSnapshot.actorNameSnapshot,
              actorImageSnapshot: actorSnapshot.actorImageSnapshot ?? undefined,
              activityGroupId,
              entryOrder,
              componentInstanceId: change.componentInstanceId,
              componentType: change.componentType,
              componentLabelSnapshot: change.componentLabelSnapshot,
              oldValue: change.oldValue,
              newValue: change.newValue,
              createdAt: groupCreatedAt,
              updatedAt: groupCreatedAt,
            }),
          );
        },
      );
      let notificationWrites: ReturnType<typeof createNotification>[] = [];

      if (membership.role === "client" && changedComponents.length > 0) {
        const projectMembers = await ctx.db
          .query("projectMembers")
          .withIndex("by_project", (query) =>
            query.eq("projectId", page.projectId),
          )
          .collect();
        const recipients = projectMembers.filter(
          (projectMember) =>
            projectMember.status === "active" &&
            projectMember.userId !== userId &&
            (projectMember.role === "owner" ||
              projectMember.role === "coCreator"),
        );
        const [firstChangedComponent] = changedComponents;

        notificationWrites = recipients.map((recipient) =>
          createNotification(ctx, {
            userId: recipient.userId,
            type: "clientStateChanged",
            ...actorSnapshot,
            projectId: project._id,
            projectSlugSnapshot: project.slug,
            projectNameSnapshot: project.name,
            pageId: page._id,
            pageTitleSnapshot: trimmedTitle,
            componentInstanceId: firstChangedComponent.instanceId,
            componentType: firstChangedComponent.type,
            componentLabelSnapshot: firstChangedComponent.label,
            changedComponentCount: changedComponents.length,
          }),
        );
      }

      await Promise.all([...notificationWrites, ...activityWrites]);
    } else if (membership.role === "client" && changedComponents.length > 0) {
      const actorSnapshot = buildProjectActorSnapshot(user, membership);
      const projectMembers = await ctx.db
        .query("projectMembers")
        .withIndex("by_project", (query) =>
          query.eq("projectId", page.projectId),
        )
        .collect();
      const recipients = projectMembers.filter(
        (projectMember) =>
          projectMember.status === "active" &&
          projectMember.userId !== userId &&
          (projectMember.role === "owner" ||
            projectMember.role === "coCreator"),
      );
      const [firstChangedComponent] = changedComponents;

      await Promise.all(
        recipients.map((recipient) =>
          createNotification(ctx, {
            userId: recipient.userId,
            type: "clientStateChanged",
            ...actorSnapshot,
            projectId: project._id,
            projectSlugSnapshot: project.slug,
            projectNameSnapshot: project.name,
            pageId: page._id,
            pageTitleSnapshot: trimmedTitle,
            componentInstanceId: firstChangedComponent.instanceId,
            componentType: firstChangedComponent.type,
            componentLabelSnapshot: firstChangedComponent.label,
            changedComponentCount: changedComponents.length,
          }),
        ),
      );
    }

    return {
      pageId: page._id,
      title: trimmedTitle,
      slug: nextSlug,
      document: nextDocument,
    };
  },
});

export const deletePage = mutation({
  args: {
    pageId: v.id("pages"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const page = await requirePageAccess(ctx, args.pageId, userId);
    await requireProjectEditor(ctx, page.projectId, userId);

    const project = await ctx.db.get(page.projectId);
    if (!project || project.isArchived) {
      throw notFound(`Project ${page.projectId} was not found.`);
    }

    await ctx.db.delete(page._id);
    await ctx.db.patch(project._id, {
      pageIds: project.pageIds.filter((pageId) => pageId !== page._id),
      updatedAt: Date.now(),
    });
  },
});
