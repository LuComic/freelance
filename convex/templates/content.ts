import { v } from "convex/values";
import { query, type MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { requireCurrentAuth } from "../lib/auth";
import { invalidState } from "../lib/errors";
import {
  assertProjectCanAddPages,
  serializePageDocumentWithLimits,
} from "../lib/pageLimits";
import { uniqueSlugFromLabel } from "../lib/slugs";
import {
  assertTemplateBlueprintV1,
  buildPageDocumentFromTemplateSource,
  getTemplatePageSource,
  getTemplateSourceItemLabels,
  type ProjectTemplateBlueprint,
  type ProjectTemplatePageBlueprint,
  type TemplateBlueprint,
} from "../../lib/templateBlueprint";
import { buildTemplateAuthorName, requireReadableTemplate } from "./model";

type TemplatePreviewSource = {
  id: Doc<"templates">["_id"];
  authorUserId: Doc<"templates">["authorUserId"];
  name: string;
  description: string | null;
  templateType: Doc<"templates">["type"];
  authorName: string;
  updatedAt: number;
};

function toTemplatePreviewPage(page: ProjectTemplatePageBlueprint) {
  const templateSource = getTemplatePageSource(page);

  return {
    title: page.title,
    description: "",
    components: getTemplateSourceItemLabels(templateSource),
  };
}

export function parseTemplateBlueprint(
  contentJson?: string | null,
): TemplateBlueprint {
  if (!contentJson) {
    throw invalidState("Template content is missing.");
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(contentJson) as unknown;
  } catch {
    throw invalidState("Template blueprint could not be parsed.");
  }

  try {
    assertTemplateBlueprintV1(parsedValue);
  } catch (error) {
    throw invalidState(
      error instanceof Error ? error.message : "Template blueprint is invalid.",
    );
  }

  return parsedValue;
}

export function getTemplateBlueprint(
  template: Pick<Doc<"templates">, "contentJson">,
) {
  return parseTemplateBlueprint(template.contentJson);
}

export function buildTemplatePreview(
  source: TemplatePreviewSource,
  blueprint: TemplateBlueprint,
) {
  if (blueprint.type === "page") {
    const templateSource = getTemplatePageSource(blueprint);

    return {
      id: source.id,
      authorUserId: source.authorUserId,
      name: source.name,
      description: source.description,
      templateType: source.templateType,
      author: source.authorName,
      updatedAt: source.updatedAt,
      blueprint,
      page: {
        title: source.name,
        description: "",
        components: getTemplateSourceItemLabels(templateSource),
      },
    };
  }

  return {
    id: source.id,
    authorUserId: source.authorUserId,
    name: source.name,
    description: source.description,
    templateType: source.templateType,
    author: source.authorName,
    updatedAt: source.updatedAt,
    blueprint,
    pages: blueprint.pages.map(toTemplatePreviewPage),
  };
}

export function assertBlueprintType<TType extends TemplateBlueprint["type"]>(
  blueprint: TemplateBlueprint,
  type: TType,
): asserts blueprint is Extract<TemplateBlueprint, { type: TType }> {
  if (blueprint.type !== type) {
    throw invalidState(`This template is not a ${type} template.`);
  }
}

export async function appendProjectTemplatePages(
  ctx: MutationCtx,
  args: {
    project: {
      _id: Id<"projects">;
      pageIds: Array<Id<"pages">>;
    };
    userId: Id<"users">;
    templateId: Id<"templates">;
    blueprint: ProjectTemplateBlueprint;
  },
) {
  const existingSlugs = new Set<string>();
  const nextPageIds = [...args.project.pageIds];
  const createdPages: Array<{
    id: Doc<"pages">["_id"];
    slug: string;
    title: string;
  }> = [];
  const now = Date.now();

  assertProjectCanAddPages(args.project, args.blueprint.pages.length);

  for (const pageId of args.project.pageIds) {
    const existingPage = await ctx.db.get(pageId);

    if (
      existingPage &&
      existingPage.isArchived !== true &&
      existingPage.projectId === args.project._id
    ) {
      existingSlugs.add(existingPage.slug);
    }
  }

  for (const pageBlueprint of args.blueprint.pages) {
    const title = pageBlueprint.title.trim();
    const slug = uniqueSlugFromLabel(title, existingSlugs, "untitled-page");
    existingSlugs.add(slug);
    const contentJson = serializePageDocumentWithLimits(
      buildPageDocumentFromTemplateSource(getTemplatePageSource(pageBlueprint)),
    );

    const pageId = await ctx.db.insert("pages", {
      projectId: args.project._id,
      title,
      slug,
      contentJson,
      sourceTemplateId: args.templateId,
      createdByUserId: args.userId,
      updatedByUserId: args.userId,
      createdAt: now,
      updatedAt: now,
    });

    nextPageIds.push(pageId);
    createdPages.push({
      id: pageId,
      slug,
      title,
    });
  }

  await ctx.db.patch(args.project._id, {
    pageIds: nextPageIds,
    updatedAt: now,
  });

  return createdPages;
}

export const getTemplatePreview = query({
  args: {
    templateId: v.id("templates"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const template = await requireReadableTemplate(
      ctx,
      args.templateId,
      userId,
    );
    const author = await ctx.db.get(template.authorUserId);
    const blueprint = getTemplateBlueprint(template);

    if (blueprint.type !== template.type) {
      throw invalidState("Template content no longer matches its saved type.");
    }

    return buildTemplatePreview(
      {
        id: template._id,
        authorUserId: template.authorUserId,
        name: template.name,
        description: template.description ?? null,
        templateType: template.type,
        authorName: buildTemplateAuthorName(author),
        updatedAt: template.updatedAt,
      },
      blueprint,
    );
  },
});
