import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { APP_ERROR_CODES, ConvexDomainError, notFound } from "../lib/errors";
import {
  compareConnectionUserListItems,
  getConnectionByPairKey,
  getOtherUserId,
  toConnectionUserListItem,
} from "./model";

export const listSidebarConnections = query({
  args: {},
  handler: async (ctx) => {
    try {
      const { userId } = await requireCurrentAuth(ctx);
      const [requestedConnections, receivedConnections] = await Promise.all([
        ctx.db
          .query("connections")
          .withIndex("by_requester", (query) =>
            query.eq("requesterUserId", userId),
          )
          .collect(),
        ctx.db
          .query("connections")
          .withIndex("by_receiver", (query) =>
            query.eq("receiverUserId", userId),
          )
          .collect(),
      ]);
      const uniqueConnections = new Map(
        [...requestedConnections, ...receivedConnections].map((connection) => [
          connection._id,
          connection,
        ]),
      );
      const otherUserIds = Array.from(uniqueConnections.values()).map(
        (connection) => getOtherUserId(connection, userId),
      );
      const users = await Promise.all(
        otherUserIds.map((otherUserId) => ctx.db.get(otherUserId)),
      );
      const userById = new Map(
        users
          .filter((user): user is NonNullable<typeof user> => user !== null)
          .map((user) => [user._id, user]),
      );
      const friends = [];
      const sentRequests = [];
      const receivedRequests = [];
      const blocked = [];

      for (const connection of uniqueConnections.values()) {
        const otherUser = userById.get(getOtherUserId(connection, userId));
        if (!otherUser) {
          continue;
        }

        const listItem = toConnectionUserListItem(otherUser);

        if (connection.status === "accepted") {
          friends.push(listItem);
          continue;
        }

        if (
          connection.status === "pending" &&
          connection.requesterUserId === userId
        ) {
          sentRequests.push(listItem);
          continue;
        }

        if (
          connection.status === "pending" &&
          connection.receiverUserId === userId
        ) {
          receivedRequests.push(listItem);
          continue;
        }

        if (
          connection.status === "blocked" &&
          connection.blockedByUserId === userId
        ) {
          blocked.push(listItem);
        }
      }

      return {
        friends: friends.sort(compareConnectionUserListItems),
        sentRequests: sentRequests.sort(compareConnectionUserListItems),
        receivedRequests: receivedRequests.sort(compareConnectionUserListItems),
        blocked: blocked.sort(compareConnectionUserListItems),
      };
    } catch (error) {
      if (
        error instanceof ConvexDomainError &&
        (error.code === APP_ERROR_CODES.notFound ||
          error.code === APP_ERROR_CODES.unauthorized)
      ) {
        return {
          friends: [],
          sentRequests: [],
          receivedRequests: [],
          blocked: [],
        };
      }

      throw error;
    }
  },
});

export const getRelationshipWithUser = query({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    try {
      const { userId } = await requireCurrentAuth(ctx);
      const targetUser = await ctx.db.get(args.targetUserId);

      if (!targetUser) {
        throw notFound(`User ${args.targetUserId} was not found.`);
      }

      const connection = await getConnectionByPairKey(
        ctx,
        userId,
        args.targetUserId,
      );
      let relationship:
        | "none"
        | "friend"
        | "sent"
        | "received"
        | "blockedByMe"
        | "blockedByThem" = "none";

      if (connection?.status === "accepted") {
        relationship = "friend";
      } else if (connection?.status === "pending") {
        relationship =
          connection.requesterUserId === userId ? "sent" : "received";
      } else if (connection?.status === "blocked") {
        relationship =
          connection.blockedByUserId === userId
            ? "blockedByMe"
            : "blockedByThem";
      }

      return {
        user: toConnectionUserListItem(targetUser),
        relationship,
      };
    } catch (error) {
      if (
        error instanceof ConvexDomainError &&
        error.code === APP_ERROR_CODES.unauthorized
      ) {
        return null;
      }

      throw error;
    }
  },
});
