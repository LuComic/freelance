import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { requireProjectMember } from "../lib/permissions";
import {
  requirePageByProjectAndSlug,
  requireProjectBySlug,
} from "../lib/projectRecords";
import {
  parsePageConfigDocument,
  parsePageLiveDocument,
} from "./content";

export const getPageEditorBySlugs = query({
  args: {
    projectSlug: v.string(),
    pageSlug: v.string(),
    pageId: v.optional(v.id("pages")),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const project = await requireProjectBySlug(ctx, args.projectSlug);
    await requireProjectMember(ctx, project._id, userId);
    const pageById = args.pageId ? await ctx.db.get(args.pageId) : null;
    const page =
      pageById &&
      pageById.isArchived !== true &&
      pageById.projectId === project._id
        ? pageById
        : await requirePageByProjectAndSlug(ctx, project._id, args.pageSlug);
    const configDocument = parsePageConfigDocument(page.contentJson);
    const liveDocument = parsePageLiveDocument(page.liveContentJson, configDocument);

    return {
      project: {
        id: project._id,
        slug: project.slug,
        name: project.name,
      },
      page: {
        id: page._id,
        slug: page.slug,
        title: page.title,
        description: page.description ?? null,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      },
      configDocument,
      liveDocument,
    };
  },
});
