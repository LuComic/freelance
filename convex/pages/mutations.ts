import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { invalidState, notFound } from "../lib/errors";
import {
  requirePageAccess,
  requireProjectEditor,
} from "../lib/permissions";
import { getOrderedProjectPages } from "../lib/projectRecords";
import { uniqueSlugFromLabel } from "../lib/slugs";
import {
  assertPageConfigDocumentV1,
  assertPageLiveDocumentV1,
  createInitialPageConfigDocument,
  createInitialPageLiveDocument,
  normalizePageConfigDocument,
  normalizePageLiveDocument,
} from "../../lib/pageDocument";
import {
  parsePageConfigDocument,
  serializePageConfigDocument,
  serializePageLiveDocument,
} from "./content";

export const createPage = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const now = Date.now();
    const project = await ctx.db.get(args.projectId);

    if (!project || project.isArchived) {
      throw notFound(`Project ${args.projectId} was not found.`);
    }

    await requireProjectEditor(ctx, project._id, userId);

    const existingPages = await getOrderedProjectPages(ctx, project);
    const nextPageNumber = existingPages.length + 1;
    const title = `Page ${nextPageNumber}`;
    const pageSlug = uniqueSlugFromLabel(
      title,
      existingPages.map((page) => page.slug),
      "untitled-page",
    );

    const configJson = serializePageConfigDocument(
      createInitialPageConfigDocument(),
    );
    const liveJson = serializePageLiveDocument(
      createInitialPageLiveDocument(),
    );

    const pageId = await ctx.db.insert("pages", {
      projectId: project._id,
      title,
      slug: pageSlug,
      contentJson: configJson,
      liveContentJson: liveJson,
      createdByUserId: userId,
      updatedByUserId: userId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(project._id, {
      pageIds: [...project.pageIds, pageId],
      updatedAt: now,
    });

    await ctx.db.patch(userId, {
      lastOpenedProjectId: project._id,
    });

    return {
      pageId,
      pageSlug,
      title,
    };
  },
});

export const renamePage = mutation({
  args: {
    pageId: v.id("pages"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const trimmedTitle = args.title.trim();

    if (!trimmedTitle) {
      throw invalidState("Page title cannot be empty.");
    }

    const page = await requirePageAccess(ctx, args.pageId, userId);
    await requireProjectEditor(ctx, page.projectId, userId);

    const project = await ctx.db.get(page.projectId);
    if (!project || project.isArchived) {
      throw notFound(`Project ${page.projectId} was not found.`);
    }

    const siblingPages = await getOrderedProjectPages(ctx, project);
    const nextSlug = uniqueSlugFromLabel(
      trimmedTitle,
      siblingPages
        .filter((siblingPage) => siblingPage._id !== page._id)
        .map((siblingPage) => siblingPage.slug),
      "untitled-page",
    );

    await ctx.db.patch(page._id, {
      title: trimmedTitle,
      slug: nextSlug,
      updatedAt: Date.now(),
      updatedByUserId: userId,
    });

    return {
      pageId: page._id,
      slug: nextSlug,
      title: trimmedTitle,
    };
  },
});

export const savePageConfigDocument = mutation({
  args: {
    pageId: v.id("pages"),
    document: v.any(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const page = await requirePageAccess(ctx, args.pageId, userId);
    await requireProjectEditor(ctx, page.projectId, userId);

    try {
      assertPageConfigDocumentV1(args.document);
    } catch (error) {
      throw invalidState(
        error instanceof Error ? error.message : "Page config document is invalid.",
      );
    }

    const normalizedConfig = normalizePageConfigDocument(args.document);

    await ctx.db.patch(page._id, {
      contentJson: serializePageConfigDocument(normalizedConfig),
      updatedAt: Date.now(),
      updatedByUserId: userId,
    });
  },
});

export const savePageLiveDocument = mutation({
  args: {
    pageId: v.id("pages"),
    document: v.any(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const page = await requirePageAccess(ctx, args.pageId, userId);

    try {
      assertPageLiveDocumentV1(args.document);
    } catch (error) {
      throw invalidState(
        error instanceof Error ? error.message : "Page live document is invalid.",
      );
    }

    const normalizedConfig = parsePageConfigDocument(page.contentJson);
    const normalizedLive = normalizePageLiveDocument(
      args.document,
      normalizedConfig,
    );

    await ctx.db.patch(page._id, {
      liveContentJson: serializePageLiveDocument(normalizedLive),
      updatedAt: Date.now(),
      updatedByUserId: userId,
    });
  },
});
