import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { query } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { APP_ERROR_CODES, ConvexDomainError } from "../lib/errors";
import { requireProjectMember } from "../lib/permissions";
import {
  getOrderedProjectPages,
  requireProjectBySlug,
} from "../lib/projectRecords";
import { buildUserDisplayName } from "../connections/model";

type ProjectSummary = {
  id: Doc<"projects">["_id"];
  slug: string;
  name: string;
  description: string | null;
  pageCount: number;
  createdAt: number;
  pages: Array<{
    id: Doc<"pages">["_id"];
    slug: string;
    title: string;
  }>;
};

function compareProjects(
  projectOrder: Map<string, number>,
  left: Pick<ProjectSummary, "id" | "createdAt" | "name">,
  right: Pick<ProjectSummary, "id" | "createdAt" | "name">,
) {
  const leftOrder = projectOrder.get(left.id);
  const rightOrder = projectOrder.get(right.id);

  if (leftOrder !== undefined && rightOrder !== undefined) {
    return leftOrder - rightOrder;
  }

  if (leftOrder !== undefined) {
    return -1;
  }

  if (rightOrder !== undefined) {
    return 1;
  }

  if (left.createdAt !== right.createdAt) {
    return left.createdAt - right.createdAt;
  }

  return left.name.localeCompare(right.name);
}

async function toProjectSummary(
  ctx: QueryCtx,
  project: Doc<"projects">,
): Promise<ProjectSummary> {
  const pages = await getOrderedProjectPages(ctx, project);
  return {
    id: project._id,
    slug: project.slug,
    name: project.name,
    description: project.description ?? null,
    pageCount: pages.length,
    createdAt: project.createdAt,
    pages: pages.map((page) => ({
      id: page._id,
      slug: page.slug,
      title: page.title,
    })),
  };
}

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

export const listCurrentUserProjects = query({
  args: {},
  handler: async (ctx) => {
    try {
      const { userId, user } = await requireCurrentAuth(ctx);
      const memberships = await ctx.db
        .query("projectMembers")
        .withIndex("by_user", (query) => query.eq("userId", userId))
        .collect();
      const visibleProjectIds = new Set(user.projectIds ?? []);

      const activeMemberships = memberships.filter(
        (membership) =>
          membership.status === "active" &&
          visibleProjectIds.has(membership.projectId),
      );
      const projects = await Promise.all(
        activeMemberships.map((membership) => ctx.db.get(membership.projectId)),
      );

      const summaries = await Promise.all(
        projects
          .filter((project): project is NonNullable<typeof project> => project !== null)
          .filter((project) => project.isArchived !== true)
          .map((project) => toProjectSummary(ctx, project)),
      );
      const projectOrder = new Map(
        (user.projectIds ?? []).map((projectId, index) => [projectId, index]),
      );

      return summaries
        .sort((left, right) => compareProjects(projectOrder, left, right))
        .map((summary) => ({
          id: summary.id,
          slug: summary.slug,
          name: summary.name,
          description: summary.description,
          pageCount: summary.pageCount,
          pages: summary.pages,
        }));
    } catch (error) {
      if (
        error instanceof ConvexDomainError &&
        (error.code === APP_ERROR_CODES.notFound ||
          error.code === APP_ERROR_CODES.unauthorized)
      ) {
        return [];
      }

      throw error;
    }
  },
});

export const getProjectSidebarBySlug = query({
  args: {
    projectSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const project = await requireProjectBySlug(ctx, args.projectSlug);
    await requireProjectMember(ctx, project._id, userId);
    const summary = await toProjectSummary(ctx, project);
    return {
      id: summary.id,
      slug: summary.slug,
      name: summary.name,
      description: summary.description,
      pageCount: summary.pageCount,
      pages: summary.pages,
    };
  },
});

export const getProjectRootBySlug = query({
  args: {
    projectSlug: v.string(),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    try {
      const { userId } = await requireCurrentAuth(ctx);
      const project = await resolveProjectByReference(ctx, args);
      await requireProjectMember(ctx, project._id, userId);
      const pages = await getOrderedProjectPages(ctx, project);
      const owner = await ctx.db.get(project.ownerId);
      const ownerName = owner
        ? buildUserDisplayName(owner)
        : String(project.ownerId);

      return {
        project: {
          id: project._id,
          slug: project.slug,
          name: project.name,
          description: project.description ?? null,
          owner: {
            id: project.ownerId,
            name: ownerName,
          },
        },
        pages: pages.map((page) => ({
          id: page._id,
          slug: page.slug,
          title: page.title,
        })),
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
