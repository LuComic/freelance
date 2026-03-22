import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { canManageTemplate, canReadTemplate } from "../lib/permissions";
import { notFound, unauthorized } from "../lib/errors";

type TemplateCtx = QueryCtx | MutationCtx;

export function buildTemplateAuthorName(user: Doc<"users"> | null) {
  const trimmedName = user?.name?.trim();
  if (trimmedName) {
    return trimmedName;
  }

  const trimmedEmail = user?.email?.trim();
  if (trimmedEmail) {
    return trimmedEmail;
  }

  return "Unknown author";
}

export async function requireTemplateById(
  ctx: TemplateCtx,
  templateId: Id<"templates">,
) {
  const template = await ctx.db.get(templateId);

  if (!template || template.isArchived === true) {
    throw notFound(`Template ${templateId} was not found.`);
  }

  return template;
}

export async function requireReadableTemplate(
  ctx: TemplateCtx,
  templateId: Id<"templates">,
  userId: Id<"users"> | null,
) {
  const template = await requireTemplateById(ctx, templateId);

  if (!canReadTemplate(template, userId)) {
    throw unauthorized("You do not have access to this template.");
  }

  return template;
}

export async function requireManageableTemplate(
  ctx: TemplateCtx,
  templateId: Id<"templates">,
  userId: Id<"users">,
) {
  const template = await requireTemplateById(ctx, templateId);

  if (!canManageTemplate(template, userId)) {
    throw unauthorized("You do not have permission to manage this template.");
  }

  return template;
}
