import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import { notFound } from "./errors";

type ProjectCtx = QueryCtx | MutationCtx;

export async function requireProjectById(
  ctx: ProjectCtx,
  projectId: Id<"projects">,
) {
  const project = await ctx.db.get(projectId);
  if (!project || project.isArchived) {
    throw notFound(`Project ${projectId} was not found.`);
  }

  return project;
}

export async function getOrderedProjectPages(
  ctx: ProjectCtx,
  project: Doc<"projects">,
) {
  const pages = await Promise.all(
    project.pageIds.map((pageId) => ctx.db.get(pageId)),
  );
  return pages.filter(
    (page): page is Doc<"pages"> =>
      page !== null &&
      page.isArchived !== true &&
      page.projectId === project._id,
  );
}

export async function requirePageByProjectId(
  ctx: ProjectCtx,
  projectId: Id<"projects">,
  pageId: Id<"pages">,
) {
  const page = await ctx.db.get(pageId);

  if (!page || page.isArchived || page.projectId !== projectId) {
    throw notFound(`Page ${pageId} was not found.`);
  }

  return page;
}

export async function requirePageById(ctx: ProjectCtx, pageId: Id<"pages">) {
  const page = await ctx.db.get(pageId);

  if (!page || page.isArchived) {
    throw notFound(`Page ${pageId} was not found.`);
  }

  return page;
}
