import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { invalidState } from "../lib/errors";

type ConnectionCtx = QueryCtx | MutationCtx;

export type ConnectionUserListItem = {
  userId: Id<"users">;
  name: string;
  email: string | null;
  bio: string | null;
  image: string | null;
};

export function buildPairKey(
  userAId: Id<"users">,
  userBId: Id<"users">,
): string {
  return [String(userAId), String(userBId)].sort().join(":");
}

export async function getConnectionByPairKey(
  ctx: ConnectionCtx,
  userAId: Id<"users">,
  userBId: Id<"users">,
) {
  const connections = await ctx.db
    .query("connections")
    .withIndex("by_pair_key", (query) =>
      query.eq("pairKey", buildPairKey(userAId, userBId)),
    )
    .collect();

  if (connections.length > 1) {
    throw invalidState("Connection data is inconsistent for this user pair.");
  }

  return connections[0] ?? null;
}

export function getOtherUserId(
  connection: Doc<"connections">,
  currentUserId: Id<"users">,
) {
  if (connection.requesterUserId === currentUserId) {
    return connection.receiverUserId;
  }

  if (connection.receiverUserId === currentUserId) {
    return connection.requesterUserId;
  }

  throw invalidState("Current user is not part of this connection.");
}

export function buildUserDisplayName(
  user: Pick<Doc<"users">, "_id" | "name" | "email">,
) {
  const trimmedName = user.name?.trim();
  if (trimmedName) {
    return trimmedName;
  }

  const trimmedEmail = user.email?.trim();
  if (trimmedEmail) {
    return trimmedEmail;
  }

  return String(user._id);
}

export function toConnectionUserListItem(
  user: Pick<Doc<"users">, "_id" | "name" | "email" | "bio" | "image">,
): ConnectionUserListItem {
  return {
    userId: user._id,
    name: buildUserDisplayName(user),
    email: user.email?.trim() || null,
    bio: user.bio?.trim() || null,
    image: user.image ?? null,
  };
}

export function compareConnectionUserListItems(
  left: ConnectionUserListItem,
  right: ConnectionUserListItem,
) {
  const byName = left.name.localeCompare(right.name);
  if (byName !== 0) {
    return byName;
  }

  const leftEmail = left.email ?? "";
  const rightEmail = right.email ?? "";
  const byEmail = leftEmail.localeCompare(rightEmail);
  if (byEmail !== 0) {
    return byEmail;
  }

  return String(left.userId).localeCompare(String(right.userId));
}
