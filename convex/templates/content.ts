import { v } from "convex/values";
import { query, type MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { requireCurrentAuth } from "../lib/auth";
import { invalidState } from "../lib/errors";
import { serializePageDocument } from "../pages/content";
import { uniqueSlugFromLabel } from "../lib/slugs";
import {
  assertTemplateBlueprintV1,
  buildPageDocumentFromComponentTypes,
  type ProjectTemplateBlueprintV1,
  type TemplateBlueprintV1,
} from "../../lib/templateBlueprint";
import { buildTemplateAuthorName, requireReadableTemplate } from "./model";

type TemplatePreviewSource = {
  id: Doc<"templates">["_id"];
  name: string;
  description: string | null;
  templateType: Doc<"templates">["type"];
  authorName: string;
  updatedAt: number;
};

function toTemplatePreviewPage(page: {
  title: string;
  components: ProjectTemplateBlueprintV1["pages"][number]["components"];
}) {
  return {
    title: page.title,
    description: "",
    components: [...page.components],
  };
}

export function parseTemplateBlueprint(
  contentJson?: string | null,
): TemplateBlueprintV1 {
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
  blueprint: TemplateBlueprintV1,
) {
  if (blueprint.type === "page") {
    return {
      id: source.id,
      name: source.name,
      description: source.description,
      templateType: source.templateType,
      author: source.authorName,
      updatedAt: source.updatedAt,
      blueprint,
      page: {
        title: source.name,
        description: "",
        components: [...blueprint.components],
      },
    };
  }

  return {
    id: source.id,
    name: source.name,
    description: source.description,
    templateType: source.templateType,
    author: source.authorName,
    updatedAt: source.updatedAt,
    blueprint,
    pages: blueprint.pages.map(toTemplatePreviewPage),
  };
}

export function assertBlueprintType<TType extends TemplateBlueprintV1["type"]>(
  blueprint: TemplateBlueprintV1,
  type: TType,
): asserts blueprint is Extract<TemplateBlueprintV1, { type: TType }> {
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
    blueprint: ProjectTemplateBlueprintV1;
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

    const pageId = await ctx.db.insert("pages", {
      projectId: args.project._id,
      title,
      slug,
      contentJson: serializePageDocument(
        buildPageDocumentFromComponentTypes(pageBlueprint.components),
      ),
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
