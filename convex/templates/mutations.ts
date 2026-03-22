import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { requireCurrentAuth } from "../lib/auth";
import { invalidState, notFound } from "../lib/errors";
import { assertNonAnonymousUser } from "../lib/guests";
import { requirePageAccess, requireProjectEditor } from "../lib/permissions";
import { getOrderedProjectPages } from "../lib/projectRecords";
import { uniqueSlugFromLabel } from "../lib/slugs";
import { templateVisibilityValidator } from "../lib/validators";
import { serializePageDocument } from "../pages/content";
import {
  assertPageDocumentV1,
  type PageDocumentV1,
} from "../../lib/pageDocument";
import {
  appendComponentTypesToDocument,
  assertTemplateBlueprintV1,
  type TemplateBlueprintV1,
} from "../../lib/templateBlueprint";
import {
  appendProjectTemplatePages,
  assertBlueprintType,
  getTemplateBlueprint,
} from "./content";
import { requireReadableTemplate } from "./model";

type SaveTemplateResult = {
  templateId: Id<"templates">;
  updatedAt: number;
  templateType: TemplateBlueprintV1["type"];
};

type ApplyPageTemplateResult = {
  pageId: Id<"pages">;
  title: string;
  slug: string;
  document: PageDocumentV1;
};

type ApplyProjectTemplateResult = {
  projectId: Id<"projects">;
  createdPages: Array<{
    id: Id<"pages">;
    slug: string;
    title: string;
  }>;
};

export const saveTemplate = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    visibility: templateVisibilityValidator,
    blueprint: v.any(),
  },
  handler: async (ctx, args): Promise<SaveTemplateResult> => {
    const { userId, user } = await requireCurrentAuth(ctx);
    assertNonAnonymousUser(user, "Guest accounts can't save templates.");
    const trimmedName = args.name.trim();
    const trimmedDescription = args.description?.trim() || undefined;

    if (!trimmedName) {
      throw invalidState("Template name cannot be empty.");
    }

    try {
      assertTemplateBlueprintV1(args.blueprint);
    } catch (error) {
      throw invalidState(
        error instanceof Error
          ? error.message
          : "Template blueprint is invalid.",
      );
    }

    const now = Date.now();
    const templateId = await ctx.db.insert("templates", {
      authorUserId: userId,
      name: trimmedName,
      description: trimmedDescription,
      type: args.blueprint.type,
      visibility: args.visibility,
      contentJson: JSON.stringify(args.blueprint),
      createdAt: now,
      updatedAt: now,
    });

    return {
      templateId,
      updatedAt: now,
      templateType: args.blueprint.type,
    };
  },
});

export const applyPageTemplate = mutation({
  args: {
    pageId: v.id("pages"),
    templateId: v.id("templates"),
    expectedUpdatedAt: v.number(),
    baseTitle: v.string(),
    baseDocument: v.any(),
  },
  handler: async (ctx, args): Promise<ApplyPageTemplateResult> => {
    const { userId } = await requireCurrentAuth(ctx);
    const page = await requirePageAccess(ctx, args.pageId, userId);
    await requireProjectEditor(ctx, page.projectId, userId);

    try {
      assertPageDocumentV1(args.baseDocument);
    } catch (error) {
      throw invalidState(
        error instanceof Error ? error.message : "Page data is invalid.",
      );
    }

    const template = await requireReadableTemplate(
      ctx,
      args.templateId,
      userId,
    );

    if (template.updatedAt !== args.expectedUpdatedAt) {
      throw invalidState(
        "This template has changed. Please search and select it again.",
      );
    }

    const blueprint = getTemplateBlueprint(template);
    assertBlueprintType(blueprint, "page");

    const project = await ctx.db.get(page.projectId);
    if (!project || project.isArchived === true) {
      throw notFound(`Project ${page.projectId} was not found.`);
    }

    const nextDocument = appendComponentTypesToDocument(
      args.baseDocument,
      blueprint.components,
    );
    const trimmedTitle = args.baseTitle.trim() || page.title;
    const siblingPages = await getOrderedProjectPages(ctx, project);
    const nextSlug = uniqueSlugFromLabel(
      trimmedTitle,
      siblingPages
        .filter((siblingPage) => siblingPage._id !== page._id)
        .map((siblingPage) => siblingPage.slug),
      "untitled-page",
    );
    const now = Date.now();

    await ctx.db.patch(page._id, {
      title: trimmedTitle,
      slug: nextSlug,
      contentJson: serializePageDocument(nextDocument),
      updatedByUserId: userId,
      updatedAt: now,
    });

    return {
      pageId: page._id,
      title: trimmedTitle,
      slug: nextSlug,
      document: nextDocument,
    };
  },
});

export const applyProjectTemplate = mutation({
  args: {
    projectId: v.id("projects"),
    templateId: v.id("templates"),
    expectedUpdatedAt: v.number(),
  },
  handler: async (ctx, args): Promise<ApplyProjectTemplateResult> => {
    const { userId } = await requireCurrentAuth(ctx);
    const project = await ctx.db.get(args.projectId);

    if (!project || project.isArchived === true) {
      throw notFound(`Project ${args.projectId} was not found.`);
    }

    await requireProjectEditor(ctx, project._id, userId);
    const template = await requireReadableTemplate(
      ctx,
      args.templateId,
      userId,
    );

    if (template.updatedAt !== args.expectedUpdatedAt) {
      throw invalidState(
        "This template has changed. Please search and select it again.",
      );
    }

    const blueprint = getTemplateBlueprint(template);
    assertBlueprintType(blueprint, "project");

    const createdPages = await appendProjectTemplatePages(ctx, {
      project,
      userId,
      templateId: args.templateId,
      blueprint,
    });

    return {
      projectId: project._id,
      createdPages,
    };
  },
});
