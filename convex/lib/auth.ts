import {
  getAuthSessionId,
  getAuthUserId,
} from "@convex-dev/auth/server";
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

export async function getCurrentSessionId(ctx: AuthCtx) {
  return getAuthSessionId(ctx);
}

export async function requireCurrentSessionId(
  ctx: AuthCtx,
): Promise<Id<"authSessions">> {
  const sessionId = await getCurrentSessionId(ctx);
  if (!sessionId) {
    throw unauthorized();
  }
  return sessionId;
}

export async function getCurrentSession(
  ctx: AuthCtx,
): Promise<Doc<"authSessions"> | null> {
  const sessionId = await getCurrentSessionId(ctx);
  if (!sessionId) {
    return null;
  }
  return ctx.db.get(sessionId);
}

export async function requireCurrentSession(
  ctx: AuthCtx,
): Promise<Doc<"authSessions">> {
  const sessionId = await requireCurrentSessionId(ctx);
  const session = await ctx.db.get(sessionId);
  if (!session) {
    throw unauthorized("Your session is no longer valid. Please sign in again.");
  }
  return session;
}

export async function requireCurrentAuth(ctx: AuthCtx): Promise<{
  userId: Id<"users">;
  sessionId: Id<"authSessions">;
  user: Doc<"users">;
  session: Doc<"authSessions">;
}> {
  const [userId, sessionId] = await Promise.all([
    getCurrentUserId(ctx),
    getCurrentSessionId(ctx),
  ]);

  if (!userId || !sessionId) {
    throw unauthorized();
  }

  const [user, session] = await Promise.all([
    ctx.db.get(userId),
    ctx.db.get(sessionId),
  ]);

  if (!user) {
    throw notFound(`User ${userId} was not found.`);
  }

  if (!session) {
    throw unauthorized("Your session is no longer valid. Please sign in again.");
  }

  if (session.userId !== userId) {
    throw unauthorized();
  }

  return { userId, sessionId, user, session };
}
