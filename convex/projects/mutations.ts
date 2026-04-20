import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { mutation } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import {
  assertNonAnonymousUser,
  deleteGuestUser,
  isAnonymousUser,
} from "../lib/guests";
import { invalidState, notFound } from "../lib/errors";
import { assertMaxLength } from "../lib/inputValidation";
import {
  assertProjectRole,
  requireProjectEditor,
  requireProjectMember,
} from "../lib/permissions";
import { serializePageDocumentWithLimits } from "../lib/pageLimits";
import { upsertProjectInviteForUser } from "./invites";
import { projectInviteRoleValidator } from "../lib/validators";
import { createInitialPageConfig } from "../pages/content";
import { generateUniqueJoinCode } from "./model";
import {
  appendProjectTemplatePages,
  getTemplateBlueprint,
} from "../templates/content";
import { requireReadableTemplate } from "../templates/model";
import type { ProjectTemplateBlueprint } from "../../lib/templateBlueprint";
import { getCurrentEntitlementsForUser } from "../billing/model";
import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH } from "../../lib/inputLimits";

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    template: v.optional(
      v.object({
        templateId: v.id("templates"),
        expectedUpdatedAt: v.number(),
      }),
    ),
    members: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          role: projectInviteRoleValidator,
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireCurrentAuth(ctx);
    assertNonAnonymousUser(user, "Guest accounts can't create projects.");
    const entitlements = await getCurrentEntitlementsForUser(ctx, userId);

    if (!entitlements.canCreateOwnedProjects) {
      throw invalidState(
        entitlements.createProjectMessage ??
          "Upgrade your plan to create more projects.",
      );
    }

    const now = Date.now();
    const trimmedName = args.name.trim();
    const trimmedDescription = args.description?.trim() || undefined;
    const additionalMembers = Array.from(
      new Map(
        (args.members ?? [])
          .filter((member) => member.userId !== userId)
          .map((member) => [member.userId, member]),
      ).values(),
    );

    if (!trimmedName) {
      throw invalidState("Project name cannot be empty.");
    }
    assertMaxLength(trimmedName, MAX_NAME_LENGTH, "Project name");
    if (trimmedDescription) {
      assertMaxLength(
        trimmedDescription,
        MAX_DESCRIPTION_LENGTH,
        "Project description",
      );
    }

    const joinCode = await generateUniqueJoinCode(ctx);
    let selectedTemplate: {
      templateId: Doc<"templates">["_id"];
      contentJson: string;
      blueprint: ProjectTemplateBlueprint;
    } | null = null;

    if (args.template) {
      const template = await requireReadableTemplate(
        ctx,
        args.template.templateId,
        userId,
      );

      if (template.updatedAt !== args.template.expectedUpdatedAt) {
        throw invalidState(
          "This template has changed. Please search and select it again.",
        );
      }

      const blueprint = getTemplateBlueprint(template);

      if (template.type !== "project" || blueprint.type !== "project") {
        throw invalidState("This template is not a project template.");
      }

      selectedTemplate = {
        templateId: template._id,
        contentJson: template.contentJson ?? "",
        blueprint,
      };
    }
    const initialContentJson = serializePageDocumentWithLimits(
      createInitialPageConfig(),
    );

    const projectId = await ctx.db.insert("projects", {
      ownerId: userId,
      createdByUserId: userId,
      name: trimmedName,
      description: trimmedDescription,
      pageIds: [],
      joinCode,
      sourceTemplateId: selectedTemplate?.templateId,
      sourceTemplateContentJson: selectedTemplate?.contentJson,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("projectMembers", {
      projectId,
      userId,
      role: "owner",
      status: "active",
      addedByUserId: userId,
      createdAt: now,
      updatedAt: now,
    });

    for (const member of additionalMembers) {
      await upsertProjectInviteForUser(ctx, {
        project: {
          _id: projectId,
          name: trimmedName,
        },
        invitedByUserId: userId,
        invitedByUser: user,
        targetUserId: member.userId,
        role: member.role,
      });
    }

    let initialPageId: Doc<"pages">["_id"];

    if (selectedTemplate) {
      const createdPages = await appendProjectTemplatePages(ctx, {
        project: {
          _id: projectId,
          pageIds: [],
        },
        userId,
        templateId: selectedTemplate.templateId,
        blueprint: selectedTemplate.blueprint,
      });
      const [firstCreatedPage] = createdPages;

      if (!firstCreatedPage) {
        throw invalidState("Project templates must include at least one page.");
      }

      initialPageId = firstCreatedPage.id;
    } else {
      const initialPageTitle = "Page 1";

      initialPageId = await ctx.db.insert("pages", {
        projectId,
        title: initialPageTitle,
        contentJson: initialContentJson,
        createdByUserId: userId,
        updatedByUserId: userId,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.patch(projectId, {
        pageIds: [initialPageId],
        updatedAt: now,
      });
    }

    const projectIds = Array.from(
      new Set([...(user.projectIds ?? []), projectId]),
    );
    await ctx.db.patch(userId, {
      projectIds,
      lastOpenedProjectId: projectId,
    });

    return {
      projectId,
      initialPageId,
    };
  },
});

export const renameProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const trimmedName = args.name.trim();

    if (!trimmedName) {
      throw invalidState("Project name cannot be empty.");
    }
    assertMaxLength(trimmedName, MAX_NAME_LENGTH, "Project name");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.isArchived) {
      throw notFound(`Project ${args.projectId} was not found.`);
    }

    await requireProjectEditor(ctx, project._id, userId);

    await ctx.db.patch(project._id, {
      name: trimmedName,
      updatedAt: Date.now(),
    });

    return {
      projectId: project._id,
      name: trimmedName,
    };
  },
});

export const updateProjectDescription = mutation({
  args: {
    projectId: v.id("projects"),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const trimmedDescription = args.description.trim();
    assertMaxLength(
      trimmedDescription,
      MAX_DESCRIPTION_LENGTH,
      "Project description",
    );

    const project = await ctx.db.get(args.projectId);
    if (!project || project.isArchived) {
      throw notFound(`Project ${args.projectId} was not found.`);
    }

    await requireProjectEditor(ctx, project._id, userId);

    await ctx.db.patch(project._id, {
      description: trimmedDescription || undefined,
      updatedAt: Date.now(),
    });

    return {
      projectId: project._id,
      description: trimmedDescription || null,
    };
  },
});

export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const project = await ctx.db.get(args.projectId);

    if (!project || project.isArchived) {
      throw notFound(`Project ${args.projectId} was not found.`);
    }

    const membership = await requireProjectMember(ctx, project._id, userId);
    assertProjectRole(membership, ["owner"]);

    const pages = await ctx.db
      .query("pages")
      .withIndex("by_project", (query) => query.eq("projectId", project._id))
      .collect();
    for (const page of pages) {
      await ctx.db.delete(page._id);
    }

    const members = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (query) => query.eq("projectId", project._id))
      .collect();
    const guestUserIds = new Set<Doc<"users">["_id"]>();

    for (const member of members) {
      const memberUser = await ctx.db.get(member.userId);

      if (isAnonymousUser(memberUser)) {
        guestUserIds.add(member.userId);
      }
    }

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    const guestUpgrades = await ctx.db
      .query("guestProjectUpgrades")
      .withIndex("by_project", (query) => query.eq("projectId", project._id))
      .collect();
    for (const guestUpgrade of guestUpgrades) {
      await ctx.db.delete(guestUpgrade._id);
    }

    const invites = await ctx.db
      .query("projectInvites")
      .withIndex("by_project", (query) => query.eq("projectId", project._id))
      .collect();
    for (const invite of invites) {
      await ctx.db.delete(invite._id);
    }

    const activity = await ctx.db
      .query("projectActivity")
      .withIndex("by_project_created", (query) =>
        query.eq("projectId", project._id),
      )
      .collect();
    for (const entry of activity) {
      await ctx.db.delete(entry._id);
    }

    const notifications = await ctx.db.query("notifications").collect();
    for (const notification of notifications) {
      if (notification.projectId === project._id) {
        await ctx.db.delete(notification._id);
      }
    }

    await ctx.db.delete(project._id);

    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      const nextProjectIds = user.projectIds?.filter(
        (projectId) => projectId !== project._id,
      );
      const patch: Partial<Doc<"users">> = {};

      if (
        user.projectIds &&
        nextProjectIds &&
        nextProjectIds.length !== user.projectIds.length
      ) {
        patch.projectIds =
          nextProjectIds.length > 0 ? nextProjectIds : undefined;
      }

      if (user.lastOpenedProjectId === project._id) {
        patch.lastOpenedProjectId = undefined;
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(user._id, patch);
      }
    }

    for (const guestUserId of guestUserIds) {
      await deleteGuestUser(ctx, guestUserId);
    }
  },
});

export const leaveProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireCurrentAuth(ctx);
    const project = await ctx.db.get(args.projectId);

    if (!project || project.isArchived) {
      throw notFound(`Project ${args.projectId} was not found.`);
    }

    const membership = await requireProjectMember(ctx, project._id, userId);

    if (membership.role === "owner") {
      throw invalidState(
        "Project owners cannot leave their own project. Delete the project instead.",
      );
    }

    if (isAnonymousUser(user)) {
      await deleteGuestUser(ctx, userId);
      return {
        projectId: project._id,
        status: "left" as const,
      };
    }

    const now = Date.now();

    await ctx.db.patch(membership._id, {
      status: "removed",
      updatedAt: now,
    });

    const nextProjectIds = user.projectIds?.filter(
      (projectId) => projectId !== project._id,
    );
    const patch: Partial<Doc<"users">> = {};

    if (
      user.projectIds &&
      nextProjectIds &&
      nextProjectIds.length !== user.projectIds.length
    ) {
      patch.projectIds = nextProjectIds.length > 0 ? nextProjectIds : undefined;
    }

    if (user.lastOpenedProjectId === project._id) {
      patch.lastOpenedProjectId = undefined;
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(user._id, patch);
    }

    return {
      projectId: project._id,
      status: "left" as const,
    };
  },
});
