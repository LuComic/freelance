import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { invalidState } from "./errors";

export function isAnonymousUser(
  user: Pick<Doc<"users">, "isAnonymous"> | null | undefined,
) {
  return user?.isAnonymous === true;
}

export function assertNonAnonymousUser(
  user: Pick<Doc<"users">, "isAnonymous">,
  message = "Guest accounts can't use this feature.",
) {
  if (isAnonymousUser(user)) {
    throw invalidState(message);
  }
}

export async function deleteGuestUser(
  ctx: MutationCtx,
  guestUserId: Id<"users">,
) {
  const guestUser = await ctx.db.get(guestUserId);

  if (!guestUser || guestUser.isAnonymous !== true) {
    return;
  }

  const [
    memberships,
    notifications,
    projectActivityEntries,
    sessions,
    authAccounts,
    upgradeTokens,
    invites,
    connections,
  ] = await Promise.all([
    ctx.db
      .query("projectMembers")
      .withIndex("by_user", (query) => query.eq("userId", guestUserId))
      .collect(),
    ctx.db
      .query("notifications")
      .collect(),
    ctx.db.query("projectActivity").collect(),
    ctx.db
      .query("authSessions")
      .withIndex("userId", (query) => query.eq("userId", guestUserId))
      .collect(),
    ctx.db.query("authAccounts").collect(),
    ctx.db
      .query("guestProjectUpgrades")
      .withIndex("by_guest_user", (query) => query.eq("guestUserId", guestUserId))
      .collect(),
    ctx.db.query("projectInvites").collect(),
    ctx.db.query("connections").collect(),
  ]);
  const userAccounts = authAccounts.filter((account) => account.userId === guestUserId);
  const accountIds = new Set(userAccounts.map((account) => account._id));
  const sessionIds = new Set(sessions.map((session) => session._id));

  for (const membership of memberships) {
    await ctx.db.delete(membership._id);
  }

  for (const notification of notifications) {
    if (
      notification.userId === guestUserId ||
      notification.actorUserId === guestUserId ||
      notification.connectionUserId === guestUserId
    ) {
      await ctx.db.delete(notification._id);
    }
  }

  for (const activityEntry of projectActivityEntries) {
    if (activityEntry.actorUserId === guestUserId) {
      await ctx.db.delete(activityEntry._id);
    }
  }

  for (const upgradeToken of upgradeTokens) {
    await ctx.db.delete(upgradeToken._id);
  }

  for (const invite of invites) {
    if (
      invite.invitedByUserId === guestUserId ||
      invite.invitedUserId === guestUserId
    ) {
      await ctx.db.delete(invite._id);
    }
  }

  for (const connection of connections) {
    if (
      connection.requesterUserId === guestUserId ||
      connection.receiverUserId === guestUserId
    ) {
      await ctx.db.delete(connection._id);
    }
  }

  for (const session of sessions) {
    const refreshTokens = await ctx.db
      .query("authRefreshTokens")
      .withIndex("sessionId", (query) => query.eq("sessionId", session._id))
      .collect();

    for (const refreshToken of refreshTokens) {
      await ctx.db.delete(refreshToken._id);
    }
  }

  if (accountIds.size > 0) {
    const verificationCodes = await ctx.db.query("authVerificationCodes").collect();

    for (const verificationCode of verificationCodes) {
      if (accountIds.has(verificationCode.accountId)) {
        await ctx.db.delete(verificationCode._id);
      }
    }
  }

  const authVerifiers = await ctx.db.query("authVerifiers").collect();

  for (const verifier of authVerifiers) {
    if (verifier.sessionId && sessionIds.has(verifier.sessionId)) {
      await ctx.db.delete(verifier._id);
    }
  }

  for (const account of userAccounts) {
    await ctx.db.delete(account._id);
  }

  for (const session of sessions) {
    await ctx.db.delete(session._id);
  }

  await ctx.db.delete(guestUserId);
}
