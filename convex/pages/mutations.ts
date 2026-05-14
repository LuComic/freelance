import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { mutation } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { invalidState, notFound } from "../lib/errors";
import { assertMaxLength } from "../lib/inputValidation";
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
import {
  assertProjectCanAddPages,
  serializePageDocumentWithLimits,
} from "../lib/pageLimits";
import { getOrderedProjectPages } from "../lib/projectRecords";
import {
  assertPageDocumentV1,
  mergePageConfigDocument,
  mergePageLiveStateDocument,
  normalizePageConfigDocument,
  type PageDocumentV1,
} from "../../lib/pageDocument";
import { createInitialPage, parsePageDocument } from "./content";
import { MAX_SHORT_TITLE_LENGTH } from "../../lib/inputLimits";

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

function sanitizeCreatorIdeaBoardDocument(
  document: PageDocumentV1,
  activeClientUserIds: Set<string>,
) {
  if (activeClientUserIds.size === 0) {
    return document;
  }

  return {
    ...document,
    components: Object.fromEntries(
      Object.entries(document.components).map(([instanceId, component]) => {
        if (component.type !== "IdeaBoard") {
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
      }),
    ) as PageDocumentV1["components"],
  };
}

function getCreatorConfigSnapshot(document: PageDocumentV1) {
  return JSON.stringify(normalizePageConfigDocument(document));
}

type SelectDocument = Extract<
  PageDocumentV1["components"][string],
  { type: "Select" }
>;
type RadioDocument = Extract<
  PageDocumentV1["components"][string],
  { type: "Radio" }
>;
type IdeaBoardDocument = Extract<
  PageDocumentV1["components"][string],
  { type: "IdeaBoard" }
>;
type IdeaBoardIdea = IdeaBoardDocument["state"]["ideas"][number];

function sanitizeClientSelectState(component: SelectDocument): SelectDocument {
  const optionIds = new Set(
    component.config.options.map((option) => option.id),
  );
  const selectedOptionIds = Array.from(
    new Set(
      component.state.selectedOptionIds.filter((optionId) =>
        optionIds.has(optionId),
      ),
    ),
  );

  return {
    ...component,
    state: {
      ...component.state,
      selectedOptionIds,
    },
  };
}

function sanitizeClientRadioState(component: RadioDocument): RadioDocument {
  const selectedOptionId =
    component.state.selectedOptionId !== null &&
    component.config.options.some(
      (option) => option.id === component.state.selectedOptionId,
    )
      ? component.state.selectedOptionId
      : null;

  return {
    ...component,
    state: {
      ...component.state,
      selectedOptionId,
    },
  };
}

function sanitizeIdeaVotes(args: {
  currentVotes: string[];
  submittedVotes: string[];
  currentUserId: string;
  canClientVote: boolean;
}) {
  const currentOtherVotes = args.currentVotes.filter(
    (voteUserId) => voteUserId !== args.currentUserId,
  );

  if (!args.canClientVote) {
    return Array.from(new Set(args.currentVotes));
  }

  const nextVotes = [...currentOtherVotes];

  if (args.submittedVotes.includes(args.currentUserId)) {
    nextVotes.push(args.currentUserId);
  }

  return Array.from(new Set(nextVotes));
}

function sanitizeClientIdeaBoardState(args: {
  currentComponent: IdeaBoardDocument;
  nextComponent: IdeaBoardDocument;
  userId: Id<"users">;
}): IdeaBoardDocument {
  const currentUserId = String(args.userId);
  const currentIdeasById = new Map(
    args.currentComponent.state.ideas.map((idea) => [idea.id, idea]),
  );
  const usedIdeaIds = new Set(
    args.currentComponent.state.ideas.map((idea) => idea.id),
  );
  const emittedCurrentIdeaIds = new Set<string>();
  const nextIdeas: IdeaBoardIdea[] = [];

  for (const submittedIdea of args.nextComponent.state.ideas) {
    const currentIdea = currentIdeasById.get(submittedIdea.id);

    if (currentIdea) {
      if (emittedCurrentIdeaIds.has(currentIdea.id)) {
        continue;
      }

      emittedCurrentIdeaIds.add(currentIdea.id);
      nextIdeas.push({
        ...currentIdea,
        votes: sanitizeIdeaVotes({
          currentVotes: currentIdea.votes,
          submittedVotes: submittedIdea.votes,
          currentUserId,
          canClientVote: args.currentComponent.config.canClientVote,
        }),
      });
      continue;
    }

    if (!args.currentComponent.config.canClientAdd) {
      continue;
    }

    let nextIdeaId = submittedIdea.id.trim();

    if (!nextIdeaId || usedIdeaIds.has(nextIdeaId)) {
      nextIdeaId = crypto.randomUUID();
    }
    usedIdeaIds.add(nextIdeaId);

    nextIdeas.push({
      ...submittedIdea,
      id: nextIdeaId,
      createdByUserId: currentUserId,
      votes:
        args.currentComponent.config.canClientVote &&
        submittedIdea.votes.includes(currentUserId)
          ? [currentUserId]
          : [],
    });
  }

  for (const currentIdea of args.currentComponent.state.ideas) {
    if (!emittedCurrentIdeaIds.has(currentIdea.id)) {
      nextIdeas.push(currentIdea);
    }
  }

  return {
    ...args.nextComponent,
    state: {
      ...args.nextComponent.state,
      ideas: nextIdeas,
    },
  };
}

function enforceClientLiveStatePermissions(args: {
  currentDocument: PageDocumentV1;
  nextDocument: PageDocumentV1;
  userId: Id<"users">;
  role: Doc<"projectMembers">["role"];
}): PageDocumentV1 {
  if (args.role === "owner" || args.role === "coCreator") {
    return args.nextDocument;
  }

  const components = Object.fromEntries(
    Object.entries(args.nextDocument.components).map(
      ([instanceId, component]) => {
        const currentComponent = args.currentDocument.components[instanceId];

        if (!currentComponent || currentComponent.type !== component.type) {
          return [instanceId, component];
        }

        if (component.type === "Select") {
          return [instanceId, sanitizeClientSelectState(component)];
        }

        if (component.type === "Radio") {
          return [instanceId, sanitizeClientRadioState(component)];
        }

        if (
          component.type === "IdeaBoard" &&
          currentComponent.type === "IdeaBoard"
        ) {
          return [
            instanceId,
            sanitizeClientIdeaBoardState({
              currentComponent,
              nextComponent: component,
              userId: args.userId,
            }),
          ];
        }

        return [instanceId, component];
      },
    ),
  ) as PageDocumentV1["components"];

  return {
    ...args.nextDocument,
    components,
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
    assertProjectCanAddPages(project);

    const existingPages = await getOrderedProjectPages(ctx, project);
    const nextPageNumber = existingPages.length + 1;
    const title = `Page ${nextPageNumber}`;
    const contentJson = serializePageDocumentWithLimits(createInitialPage());

    const pageId = await ctx.db.insert("pages", {
      projectId: project._id,
      title,
      contentJson,
      createdByUserId: userId,
      updatedByUserId: userId,
      isClientVisible: true,
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
      title,
    };
  },
});

export const togglePageClientVisibility = mutation({
  args: {
    pageId: v.id("pages"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const page = await requirePageAccess(ctx, args.pageId, userId);
    await requireProjectEditor(ctx, page.projectId, userId);

    const isClientVisible = page.isClientVisible === false;
    const now = Date.now();

    await ctx.db.patch(page._id, {
      isClientVisible,
      updatedAt: now,
      updatedByUserId: userId,
    });

    return {
      pageId: page._id,
      isClientVisible,
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
    assertMaxLength(trimmedTitle, MAX_SHORT_TITLE_LENGTH, "Page title");

    const page = await requirePageAccess(ctx, args.pageId, userId);
    await requireProjectEditor(ctx, page.projectId, userId);

    await ctx.db.patch(page._id, {
      title: trimmedTitle,
      updatedAt: Date.now(),
      updatedByUserId: userId,
    });

    return {
      pageId: page._id,
      title: trimmedTitle,
    };
  },
});

export const savePage = mutation({
  args: {
    pageId: v.id("pages"),
    title: v.string(),
    document: v.any(),
    baseTitle: v.string(),
    baseDocument: v.any(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const page = await requirePageAccess(ctx, args.pageId, userId);
    await requireProjectEditor(ctx, page.projectId, userId);
    const trimmedTitle = args.title.trim();
    const trimmedBaseTitle = args.baseTitle.trim();

    if (!trimmedTitle) {
      throw invalidState("Page title cannot be empty.");
    }
    assertMaxLength(trimmedTitle, MAX_SHORT_TITLE_LENGTH, "Page title");

    try {
      assertPageDocumentV1(args.document);
    } catch (error) {
      throw invalidState(
        error instanceof Error ? error.message : "Page document is invalid.",
      );
    }

    try {
      assertPageDocumentV1(args.baseDocument);
    } catch (error) {
      throw invalidState(
        error instanceof Error
          ? error.message
          : "Page base document is invalid.",
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
    if (
      page.title !== trimmedBaseTitle ||
      getCreatorConfigSnapshot(currentDocument) !==
        getCreatorConfigSnapshot(args.baseDocument)
    ) {
      throw invalidState(
        "This page changed in another creator session. Refresh to load the latest version.",
      );
    }

    const nextDocument = sanitizeCreatorIdeaBoardDocument(
      mergePageConfigDocument(currentDocument, args.document),
      activeClientUserIds,
    );
    const now = Date.now();
    const contentJson = serializePageDocumentWithLimits(nextDocument);

    await ctx.db.patch(page._id, {
      title: trimmedTitle,
      contentJson,
      updatedAt: now,
      updatedByUserId: userId,
    });

    return {
      pageId: page._id,
      title: trimmedTitle,
      document: nextDocument,
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
    assertMaxLength(trimmedTitle, MAX_SHORT_TITLE_LENGTH, "Page title");

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
    const mergedDocument = mergePageLiveStateDocument(
      currentDocument,
      args.document,
    );
    const nextDocument = enforceClientLiveStatePermissions({
      currentDocument,
      nextDocument: mergedDocument,
      userId,
      role: membership.role,
    });
    const shouldRenamePage = trimmedTitle !== page.title;

    if (shouldRenamePage) {
      await requireProjectEditor(ctx, page.projectId, userId);
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
    const contentJson = serializePageDocumentWithLimits(nextDocument);

    await ctx.db.patch(page._id, {
      title: trimmedTitle,
      contentJson,
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
