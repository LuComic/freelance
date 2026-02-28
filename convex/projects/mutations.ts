import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { mutation } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { invalidState, notFound } from "../lib/errors";
import {
  assertProjectRole,
  requireProjectEditor,
  requireProjectMember,
} from "../lib/permissions";
import { uniqueSlugFromLabel } from "../lib/slugs";
import {
  createInitialPageConfig,
  serializePageConfigDocument,
} from "../pages/content";

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireCurrentAuth(ctx);
    const now = Date.now();
    const trimmedName = args.name.trim();
    const trimmedDescription = args.description?.trim() || undefined;

    if (!trimmedName) {
      throw invalidState("Project name cannot be empty.");
    }

    const existingProjects = await ctx.db.query("projects").collect();
    const projectSlug = uniqueSlugFromLabel(
      trimmedName,
      existingProjects.map((project) => project.slug),
      "untitled-project",
    );

    const initialContentJson = serializePageConfigDocument(
      createInitialPageConfig(),
    );

    const projectId = await ctx.db.insert("projects", {
      ownerId: userId,
      createdByUserId: userId,
      slug: projectSlug,
      name: trimmedName,
      description: trimmedDescription,
      pageIds: [],
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

    const initialPageTitle = "Page 1";
    const initialPageSlug = "page-1";

    const initialPageId = await ctx.db.insert("pages", {
      projectId,
      title: initialPageTitle,
      slug: initialPageSlug,
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

    const projectIds = Array.from(new Set([...(user.projectIds ?? []), projectId]));
    await ctx.db.patch(userId, {
      projectIds,
      lastOpenedProjectId: projectId,
    });

    return {
      projectId,
      projectSlug,
      initialPageId,
      initialPageSlug,
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

    const project = await ctx.db.get(args.projectId);
    if (!project || project.isArchived) {
      throw notFound(`Project ${args.projectId} was not found.`);
    }

    await requireProjectEditor(ctx, project._id, userId);

    const existingProjects = await ctx.db.query("projects").collect();
    const projectSlug = uniqueSlugFromLabel(
      trimmedName,
      existingProjects
        .filter(
          (existingProject) =>
            existingProject._id !== project._id &&
            existingProject.isArchived !== true,
        )
        .map((existingProject) => existingProject.slug),
      "untitled-project",
    );

    await ctx.db.patch(project._id, {
      name: trimmedName,
      slug: projectSlug,
      updatedAt: Date.now(),
    });

    return {
      projectId: project._id,
      projectSlug,
      name: trimmedName,
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
    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    const invites = await ctx.db
      .query("projectInvites")
      .withIndex("by_project", (query) => query.eq("projectId", project._id))
      .collect();
    for (const invite of invites) {
      await ctx.db.delete(invite._id);
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
        patch.projectIds = nextProjectIds.length > 0 ? nextProjectIds : undefined;
      }

      if (user.lastOpenedProjectId === project._id) {
        patch.lastOpenedProjectId = undefined;
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(user._id, patch);
      }
    }
  },
});
