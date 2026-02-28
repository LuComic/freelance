import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { query } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { requireProjectMember } from "../lib/permissions";
import {
  getOrderedProjectPages,
  requireProjectBySlug,
} from "../lib/projectRecords";

type ProjectSummary = {
  id: Doc<"projects">["_id"];
  slug: string;
  name: string;
  description: string | null;
  pageCount: number;
  pages: Array<{
    id: Doc<"pages">["_id"];
    slug: string;
    title: string;
  }>;
  updatedAt: number;
};

function compareProjects(
  lastOpenedProjectId: string | undefined,
  left: Pick<ProjectSummary, "id" | "updatedAt">,
  right: Pick<ProjectSummary, "id" | "updatedAt">,
) {
  if (lastOpenedProjectId) {
    if (left.id === lastOpenedProjectId && right.id !== lastOpenedProjectId) {
      return -1;
    }
    if (right.id === lastOpenedProjectId && left.id !== lastOpenedProjectId) {
      return 1;
    }
  }

  return right.updatedAt - left.updatedAt;
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
    pages: pages.map((page) => ({
      id: page._id,
      slug: page.slug,
      title: page.title,
    })),
    updatedAt: project.updatedAt,
  };
}

export const listCurrentUserProjects = query({
  args: {},
  handler: async (ctx) => {
    const { userId, user } = await requireCurrentAuth(ctx);
    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (query) => query.eq("userId", userId))
      .collect();

    const activeMemberships = memberships.filter(
      (membership) => membership.status === "active",
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

    return summaries
      .sort((left, right) =>
        compareProjects(user.lastOpenedProjectId, left, right),
      )
      .map((summary) => ({
        id: summary.id,
        slug: summary.slug,
        name: summary.name,
        description: summary.description,
        pageCount: summary.pageCount,
        pages: summary.pages,
      }));
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
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const project = await requireProjectBySlug(ctx, args.projectSlug);
    await requireProjectMember(ctx, project._id, userId);
    const pages = await getOrderedProjectPages(ctx, project);

    return {
      project: {
        id: project._id,
        slug: project.slug,
        name: project.name,
        description: project.description ?? null,
      },
      pages: pages.map((page) => ({
        id: page._id,
        slug: page.slug,
        title: page.title,
      })),
    };
  },
});
