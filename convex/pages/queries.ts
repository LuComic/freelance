import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { APP_ERROR_CODES, ConvexDomainError } from "../lib/errors";
import { requireProjectMember } from "../lib/permissions";
import {
  requirePageByProjectAndSlug,
  requireProjectBySlug,
} from "../lib/projectRecords";
import { parsePageDocument } from "./content";

async function resolveProjectByReference(
  ctx: QueryCtx,
  args: {
    projectSlug: string;
    projectId?: Doc<"projects">["_id"];
  },
) {
  if (args.projectId) {
    const project = await ctx.db.get(args.projectId);
    if (project && project.isArchived !== true) {
      return project;
    }
  }

  return requireProjectBySlug(ctx, args.projectSlug);
}

export const getPageEditorBySlugs = query({
  args: {
    projectSlug: v.string(),
    projectId: v.optional(v.id("projects")),
    pageSlug: v.string(),
    pageId: v.optional(v.id("pages")),
  },
  handler: async (ctx, args) => {
    try {
      const { userId } = await requireCurrentAuth(ctx);
      const project = await resolveProjectByReference(ctx, args);
      await requireProjectMember(ctx, project._id, userId);
      const pageById = args.pageId ? await ctx.db.get(args.pageId) : null;
      const page =
        pageById &&
        pageById.isArchived !== true &&
        pageById.projectId === project._id
          ? pageById
          : await requirePageByProjectAndSlug(ctx, project._id, args.pageSlug);
      const document = parsePageDocument(page.contentJson);

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
        document,
      };
    } catch (error) {
      if (
        error instanceof ConvexDomainError &&
        (error.code === APP_ERROR_CODES.notFound ||
          error.code === APP_ERROR_CODES.unauthorized)
      ) {
        return null;
      }

      throw error;
    }
  },
});
