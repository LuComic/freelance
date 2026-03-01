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
  assertPageDocumentV1,
  mergePageLiveStateDocument,
} from "../../lib/pageDocument";
import {
  createInitialPage,
  parsePageDocument,
  serializePageDocument,
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

    const contentJson = serializePageDocument(createInitialPage());

    const pageId = await ctx.db.insert("pages", {
      projectId: project._id,
      title,
      slug: pageSlug,
      contentJson,
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

export const savePage = mutation({
  args: {
    pageId: v.id("pages"),
    title: v.string(),
    document: v.any(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const page = await requirePageAccess(ctx, args.pageId, userId);
    await requireProjectEditor(ctx, page.projectId, userId);
    const trimmedTitle = args.title.trim();

    if (!trimmedTitle) {
      throw invalidState("Page title cannot be empty.");
    }

    try {
      assertPageDocumentV1(args.document);
    } catch (error) {
      throw invalidState(
        error instanceof Error ? error.message : "Page document is invalid.",
      );
    }

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
    const now = Date.now();

    await ctx.db.patch(page._id, {
      title: trimmedTitle,
      slug: nextSlug,
      contentJson: serializePageDocument(args.document),
      updatedAt: now,
      updatedByUserId: userId,
    });

    return {
      pageId: page._id,
      slug: nextSlug,
      title: trimmedTitle,
    };
  },
});

export const savePageLiveState = mutation({
  args: {
    pageId: v.id("pages"),
    document: v.any(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const page = await requirePageAccess(ctx, args.pageId, userId);

    try {
      assertPageDocumentV1(args.document);
    } catch (error) {
      throw invalidState(
        error instanceof Error ? error.message : "Page document is invalid.",
      );
    }

    const project = await ctx.db.get(page.projectId);
    if (!project || project.isArchived) {
      throw notFound(`Project ${page.projectId} was not found.`);
    }

    const currentDocument = parsePageDocument(page.contentJson);
    const nextDocument = mergePageLiveStateDocument(
      currentDocument,
      args.document,
    );
    const now = Date.now();

    await ctx.db.patch(page._id, {
      contentJson: serializePageDocument(nextDocument),
      updatedAt: now,
      updatedByUserId: userId,
    });

    return {
      pageId: page._id,
      document: nextDocument,
    };
  },
});

export const deletePage = mutation({
  args: {
    pageId: v.id("pages"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const page = await requirePageAccess(ctx, args.pageId, userId);
    await requireProjectEditor(ctx, page.projectId, userId);

    const project = await ctx.db.get(page.projectId);
    if (!project || project.isArchived) {
      throw notFound(`Project ${page.projectId} was not found.`);
    }

    await ctx.db.delete(page._id);
    await ctx.db.patch(project._id, {
      pageIds: project.pageIds.filter((pageId) => pageId !== page._id),
      updatedAt: Date.now(),
    });
  },
});
