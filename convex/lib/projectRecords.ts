import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import { notFound } from "./errors";

type ProjectCtx = QueryCtx | MutationCtx;

export async function getProjectBySlug(ctx: ProjectCtx, slug: string) {
  return ctx.db
    .query("projects")
    .withIndex("by_slug", (query) => query.eq("slug", slug))
    .unique();
}

export async function requireProjectBySlug(ctx: ProjectCtx, slug: string) {
  const project = await getProjectBySlug(ctx, slug);
  if (!project || project.isArchived) {
    throw notFound(`Project ${slug} was not found.`);
  }
  return project;
}

export async function getOrderedProjectPages(
  ctx: ProjectCtx,
  project: Doc<"projects">,
) {
  const pages = await Promise.all(project.pageIds.map((pageId) => ctx.db.get(pageId)));
  return pages.filter(
    (page): page is Doc<"pages"> =>
      page !== null && page.isArchived !== true && page.projectId === project._id,
  );
}

export async function requirePageByProjectAndSlug(
  ctx: ProjectCtx,
  projectId: Id<"projects">,
  pageSlug: string,
) {
  const page = await ctx.db
    .query("pages")
    .withIndex("by_project_slug", (query) =>
      query.eq("projectId", projectId).eq("slug", pageSlug),
    )
    .unique();

  if (!page || page.isArchived) {
    throw notFound(`Page ${pageSlug} was not found.`);
  }

  return page;
}
