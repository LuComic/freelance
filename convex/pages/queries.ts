import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { APP_ERROR_CODES, ConvexDomainError } from "../lib/errors";
import { requireProjectMember } from "../lib/permissions";
import {
  requirePageByProjectId,
  requireProjectById,
} from "../lib/projectRecords";
import { parsePageDocument } from "./content";

export const getPageEditor = query({
  args: {
    projectId: v.id("projects"),
    pageId: v.id("pages"),
  },
  handler: async (ctx, args) => {
    try {
      const { userId } = await requireCurrentAuth(ctx);
      const project = await requireProjectById(ctx, args.projectId);
      const viewerMembership = await requireProjectMember(
        ctx,
        project._id,
        userId,
      );
      const page = await requirePageByProjectId(ctx, project._id, args.pageId);
      const document = parsePageDocument(page.contentJson);

      return {
        project: {
          id: project._id,
          name: project.name,
        },
        page: {
          id: page._id,
          title: page.title,
          description: page.description ?? null,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt,
        },
        viewerRole: viewerMembership.role,
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
