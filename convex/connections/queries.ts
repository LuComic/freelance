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
import { listHistoricalCollaborators } from "../projects/members";
import { listIncomingPendingProjectInvitesForSidebar } from "../projects/invites";

export const listSidebarConnections = query({
  args: {},
  handler: async (ctx) => {
    try {
      const { userId, user } = await requireCurrentAuth(ctx);
      const [
        requestedConnections,
        receivedConnections,
        collaborators,
        invites,
      ] = await Promise.all([
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
        listHistoricalCollaborators(ctx, userId),
        listIncomingPendingProjectInvitesForSidebar(ctx, userId, user.email),
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
      const relationshipByUserId = new Map<
        string,
        | "none"
        | "friend"
        | "sent"
        | "received"
        | "blockedByMe"
        | "blockedByThem"
      >();
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
          relationshipByUserId.set(String(otherUser._id), "friend");
          friends.push(listItem);
          continue;
        }

        if (
          connection.status === "pending" &&
          connection.requesterUserId === userId
        ) {
          relationshipByUserId.set(String(otherUser._id), "sent");
          sentRequests.push(listItem);
          continue;
        }

        if (
          connection.status === "pending" &&
          connection.receiverUserId === userId
        ) {
          relationshipByUserId.set(String(otherUser._id), "received");
          receivedRequests.push(listItem);
          continue;
        }

        if (
          connection.status === "blocked" &&
          connection.blockedByUserId === userId
        ) {
          relationshipByUserId.set(String(otherUser._id), "blockedByMe");
          blocked.push(listItem);
          continue;
        }

        if (connection.status === "blocked") {
          relationshipByUserId.set(String(otherUser._id), "blockedByThem");
        }
      }

      return {
        friends: friends.sort(compareConnectionUserListItems),
        collaborators: collaborators.map((collaborator) => ({
          ...collaborator,
          relationship:
            relationshipByUserId.get(String(collaborator.userId)) ?? "none",
        })),
        invites,
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
          collaborators: [],
          invites: [],
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
