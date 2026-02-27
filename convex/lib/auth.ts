import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import { notFound, unauthorized } from "./errors";

type AuthCtx = QueryCtx | MutationCtx;

export async function getCurrentUserId(ctx: AuthCtx) {
  return getAuthUserId(ctx);
}

export async function requireCurrentUserId(ctx: AuthCtx): Promise<Id<"users">> {
  const userId = await getCurrentUserId(ctx);
  if (!userId) {
    throw unauthorized();
  }
  return userId;
}

export async function getCurrentUser(ctx: AuthCtx): Promise<Doc<"users"> | null> {
  const userId = await getCurrentUserId(ctx);
  if (!userId) {
    return null;
  }
  return ctx.db.get(userId);
}

export async function requireCurrentUser(ctx: AuthCtx): Promise<Doc<"users">> {
  const userId = await requireCurrentUserId(ctx);
  const user = await ctx.db.get(userId);
  if (!user) {
    throw notFound(`User ${userId} was not found.`);
  }
  return user;
}
