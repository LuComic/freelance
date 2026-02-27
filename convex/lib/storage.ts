import type { ActionCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { notFound } from "./errors";

type BlobStorageCtx = Pick<ActionCtx, "storage">;
type StorageWriterCtx = Pick<MutationCtx, "storage"> | Pick<ActionCtx, "storage">;

export async function readStorageBlob(
  ctx: BlobStorageCtx,
  storageId: Id<"_storage">,
) {
  const blob = await ctx.storage.get(storageId);
  if (!blob) {
    throw notFound(`Storage blob ${storageId} was not found.`);
  }
  return blob;
}

export async function readStorageText(
  ctx: BlobStorageCtx,
  storageId: Id<"_storage">,
) {
  const blob = await readStorageBlob(ctx, storageId);
  return blob.text();
}

export async function storeText(
  ctx: BlobStorageCtx,
  text: string,
  contentType = "text/plain;charset=utf-8",
) {
  return ctx.storage.store(new Blob([text], { type: contentType }));
}

export async function copyStorageBlob(
  ctx: BlobStorageCtx,
  storageId: Id<"_storage">,
) {
  const blob = await readStorageBlob(ctx, storageId);
  return ctx.storage.store(blob);
}

export async function generateUploadUrl(ctx: Pick<MutationCtx, "storage">) {
  return ctx.storage.generateUploadUrl();
}

export async function deleteStorageBlob(
  ctx: StorageWriterCtx,
  storageId: Id<"_storage">,
) {
  await ctx.storage.delete(storageId);
}

export async function replaceStoredText(
  ctx: BlobStorageCtx,
  currentStorageId: Id<"_storage">,
  nextText: string,
  contentType = "text/plain;charset=utf-8",
) {
  const nextStorageId = await storeText(ctx, nextText, contentType);
  await deleteStorageBlob(ctx, currentStorageId);
  return nextStorageId;
}
