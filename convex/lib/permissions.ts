import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import { notFound, unauthorized } from "./errors";
import { PROJECT_EDITOR_ROLES, type ProjectMemberRole } from "./validators";

type PermissionCtx = QueryCtx | MutationCtx;

type ProjectMemberDoc = Doc<"projectMembers">;

export async function requireProjectMember(
  ctx: PermissionCtx,
  projectId: Id<"projects">,
  userId: Id<"users">,
): Promise<ProjectMemberDoc> {
  const membership = await ctx.db
    .query("projectMembers")
    .withIndex("by_project_user", (query) =>
      query.eq("projectId", projectId).eq("userId", userId),
    )
    .unique();

  if (!membership || membership.status !== "active") {
    throw unauthorized("You do not have access to this project.");
  }

  return membership;
}

export async function requireProjectEditor(
  ctx: PermissionCtx,
  projectId: Id<"projects">,
  userId: Id<"users">,
) {
  const membership = await requireProjectMember(ctx, projectId, userId);
  if (!PROJECT_EDITOR_ROLES.includes(membership.role)) {
    throw unauthorized("Only owners and co-creators can modify this project.");
  }
  return membership;
}

export function assertProjectRole(
  membership: ProjectMemberDoc,
  allowedRoles: readonly ProjectMemberRole[],
) {
  if (!allowedRoles.includes(membership.role)) {
    throw unauthorized("You do not have permission to perform this project action.");
  }
}

export async function requirePageAccess(
  ctx: PermissionCtx,
  pageId: Id<"pages">,
  userId: Id<"users">,
) {
  const page = await ctx.db.get(pageId);
  if (!page || page.isArchived) {
    throw notFound(`Page ${pageId} was not found.`);
  }

  await requireProjectMember(ctx, page.projectId, userId);
  return page;
}

export function canReadTemplate(
  template: Doc<"templates">,
  userId: Id<"users"> | null,
) {
  return template.visibility === "public" || template.authorUserId === userId;
}

export function canManageTemplate(
  template: Doc<"templates">,
  userId: Id<"users">,
) {
  return template.authorUserId === userId;
}
