import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { mutation } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import {
  duplicateConnection,
  invalidState,
  notFound,
} from "../lib/errors";
import { buildPairKey, getConnectionByPairKey } from "./model";

async function requireTargetUser(
  ctx: MutationCtx,
  currentUserId: Id<"users">,
  targetUserId: Id<"users">,
) {
  if (currentUserId === targetUserId) {
    throw invalidState("You can't do that to yourself.");
  }

  const targetUser = await ctx.db.get(targetUserId);
  if (!targetUser) {
    throw notFound(`User ${targetUserId} was not found.`);
  }

  return targetUser;
}

function ensureNotBlockedByOtherParty(
  blockedByUserId: Id<"users"> | undefined,
  currentUserId: Id<"users">,
) {
  if (blockedByUserId && blockedByUserId !== currentUserId) {
    throw invalidState("You can't interact with this user right now.");
  }
}

export const sendFriendRequest = mutation({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    await requireTargetUser(ctx, userId, args.targetUserId);
    const now = Date.now();
    const connection = await getConnectionByPairKey(ctx, userId, args.targetUserId);

    if (!connection) {
      await ctx.db.insert("connections", {
        requesterUserId: userId,
        receiverUserId: args.targetUserId,
        pairKey: buildPairKey(userId, args.targetUserId),
        status: "pending",
        actedByUserId: userId,
        createdAt: now,
        updatedAt: now,
      });
      return;
    }

    ensureNotBlockedByOtherParty(connection.blockedByUserId, userId);

    if (connection.status === "blocked") {
      throw invalidState("Unblock this user before sending a friend request.");
    }

    if (connection.status === "pending") {
      if (connection.requesterUserId === userId) {
        throw duplicateConnection("You already sent this user a friend request.");
      }

      throw invalidState("This user already sent you a friend request.");
    }

    if (connection.status === "accepted") {
      throw invalidState("You are already friends with this user.");
    }

    await ctx.db.patch(connection._id, {
      requesterUserId: userId,
      receiverUserId: args.targetUserId,
      pairKey: buildPairKey(userId, args.targetUserId),
      status: "pending",
      blockedByUserId: undefined,
      actedByUserId: userId,
      updatedAt: now,
    });
  },
});

export const acceptFriendRequest = mutation({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    await requireTargetUser(ctx, userId, args.targetUserId);
    const connection = await getConnectionByPairKey(ctx, userId, args.targetUserId);

    if (!connection) {
      throw invalidState("There is no friend request to accept.");
    }

    ensureNotBlockedByOtherParty(connection.blockedByUserId, userId);

    if (connection.status !== "pending" || connection.receiverUserId !== userId) {
      throw invalidState("There is no friend request to accept.");
    }

    await ctx.db.patch(connection._id, {
      status: "accepted",
      blockedByUserId: undefined,
      actedByUserId: userId,
      updatedAt: Date.now(),
    });
  },
});

export const declineFriendRequest = mutation({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    await requireTargetUser(ctx, userId, args.targetUserId);
    const connection = await getConnectionByPairKey(ctx, userId, args.targetUserId);

    if (!connection) {
      throw invalidState("There is no friend request to decline.");
    }

    ensureNotBlockedByOtherParty(connection.blockedByUserId, userId);

    if (connection.status !== "pending" || connection.receiverUserId !== userId) {
      throw invalidState("There is no friend request to decline.");
    }

    await ctx.db.patch(connection._id, {
      status: "declined",
      blockedByUserId: undefined,
      actedByUserId: userId,
      updatedAt: Date.now(),
    });
  },
});

export const cancelFriendRequest = mutation({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    await requireTargetUser(ctx, userId, args.targetUserId);
    const connection = await getConnectionByPairKey(ctx, userId, args.targetUserId);

    if (!connection) {
      throw invalidState("There is no friend request to cancel.");
    }

    ensureNotBlockedByOtherParty(connection.blockedByUserId, userId);

    if (connection.status !== "pending" || connection.requesterUserId !== userId) {
      throw invalidState("There is no friend request to cancel.");
    }

    await ctx.db.patch(connection._id, {
      status: "canceled",
      blockedByUserId: undefined,
      actedByUserId: userId,
      updatedAt: Date.now(),
    });
  },
});

export const removeFriend = mutation({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    await requireTargetUser(ctx, userId, args.targetUserId);
    const connection = await getConnectionByPairKey(ctx, userId, args.targetUserId);

    if (!connection) {
      throw invalidState("This user is not in your friends list.");
    }

    ensureNotBlockedByOtherParty(connection.blockedByUserId, userId);

    if (connection.status !== "accepted") {
      throw invalidState("This user is not in your friends list.");
    }

    await ctx.db.patch(connection._id, {
      status: "removed",
      blockedByUserId: undefined,
      actedByUserId: userId,
      updatedAt: Date.now(),
    });
  },
});

export const blockUser = mutation({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    await requireTargetUser(ctx, userId, args.targetUserId);
    const now = Date.now();
    const connection = await getConnectionByPairKey(ctx, userId, args.targetUserId);

    if (!connection) {
      await ctx.db.insert("connections", {
        requesterUserId: userId,
        receiverUserId: args.targetUserId,
        pairKey: buildPairKey(userId, args.targetUserId),
        status: "blocked",
        blockedByUserId: userId,
        actedByUserId: userId,
        createdAt: now,
        updatedAt: now,
      });
      return;
    }

    ensureNotBlockedByOtherParty(connection.blockedByUserId, userId);

    await ctx.db.patch(connection._id, {
      requesterUserId:
        connection.status === "blocked" ? connection.requesterUserId : userId,
      receiverUserId:
        connection.status === "blocked"
          ? connection.receiverUserId
          : args.targetUserId,
      pairKey: buildPairKey(userId, args.targetUserId),
      status: "blocked",
      blockedByUserId: userId,
      actedByUserId: userId,
      updatedAt: now,
    });
  },
});

export const unblockUser = mutation({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    await requireTargetUser(ctx, userId, args.targetUserId);
    const connection = await getConnectionByPairKey(ctx, userId, args.targetUserId);

    if (
      !connection ||
      connection.status !== "blocked" ||
      connection.blockedByUserId !== userId
    ) {
      throw invalidState("This user is not blocked.");
    }

    await ctx.db.patch(connection._id, {
      status: "removed",
      blockedByUserId: undefined,
      actedByUserId: userId,
      updatedAt: Date.now(),
    });
  },
});
