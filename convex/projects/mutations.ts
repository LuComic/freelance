import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { invalidState } from "../lib/errors";
import { uniqueSlugFromLabel } from "../lib/slugs";
import {
  createInitialPageConfig,
  createInitialPageLive,
  serializePageConfigDocument,
  serializePageLiveDocument,
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

    const initialConfigJson = serializePageConfigDocument(
      createInitialPageConfig(),
    );
    const initialLiveJson = serializePageLiveDocument(
      createInitialPageLive(),
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
      contentJson: initialConfigJson,
      liveContentJson: initialLiveJson,
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
