import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { invalidState } from "../lib/errors";
import { requirePageAccess, requireProjectEditor } from "../lib/permissions";
import {
  ALLOWED_PAGE_IMAGE_MIME_TYPES,
  MAX_PAGE_IMAGE_BYTES,
} from "../../lib/pageLimits";
import { parsePageDocument } from "./content";

function assertAllowedImage(contentType: string, size: number) {
  if (
    !ALLOWED_PAGE_IMAGE_MIME_TYPES.includes(
      contentType as (typeof ALLOWED_PAGE_IMAGE_MIME_TYPES)[number],
    )
  ) {
    throw invalidState("Only JPEG, PNG, WebP, and GIF images are supported.");
  }
  if (size <= 0 || size > MAX_PAGE_IMAGE_BYTES) {
    throw invalidState(
      `Images must be smaller than ${MAX_PAGE_IMAGE_BYTES / (1024 * 1024)} MB.`,
    );
  }
}

export const generatePageImageUploadUrl = mutation({
  args: {
    pageId: v.id("pages"),
    contentType: v.string(),
    size: v.number(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const page = await requirePageAccess(ctx, args.pageId, userId);
    await requireProjectEditor(ctx, page.projectId, userId);
    assertAllowedImage(args.contentType, args.size);
    return await ctx.storage.generateUploadUrl();
  },
});

export const validateUploadedPageImage = mutation({
  args: { pageId: v.id("pages"), storageId: v.id("_storage") },
  returns: v.object({
    storageId: v.id("_storage"),
    contentType: v.string(),
    size: v.number(),
  }),
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const page = await requirePageAccess(ctx, args.pageId, userId);
    await requireProjectEditor(ctx, page.projectId, userId);

    const metadata = await ctx.db.system.get(args.storageId);
    if (!metadata) throw invalidState("Uploaded image was not found.");

    const contentType = metadata.contentType ?? "";
    const size = metadata.size;
    try {
      assertAllowedImage(contentType, size);
    } catch (error) {
      await ctx.storage.delete(args.storageId);
      throw error;
    }

    return { storageId: args.storageId, contentType, size };
  },
});

export const getPageImageUrl = query({
  args: { pageId: v.id("pages"), storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const page = await requirePageAccess(ctx, args.pageId, userId);
    const document = parsePageDocument(page.contentJson);
    const isReferenced = Object.values(document.components).some(
      (component) =>
        component.type === "Image" &&
        component.config.storageId === args.storageId,
    );

    if (!isReferenced) return null;
    return await ctx.storage.getUrl(args.storageId);
  },
});
