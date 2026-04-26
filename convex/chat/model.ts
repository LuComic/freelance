import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { notFound } from "../lib/errors";

type ChatCtx = QueryCtx | MutationCtx;

export const PROJECT_CHAT_MESSAGE_MAX_LENGTH = 1000;
export const PROJECT_CHAT_RATE_LIMIT_COUNT = 5;
export const PROJECT_CHAT_RATE_LIMIT_WINDOW_MS = 10_000;

export type ProjectChatMessageListItem = {
  id: Id<"projectChatMessages">;
  projectId: Id<"projects">;
  authorUserId: Id<"users">;
  authorName: string;
  authorImage: string | null;
  body: string | null;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
  isDeleted: boolean;
  isOwn: boolean;
  canDelete: boolean;
};

export async function getProjectChatMessageOrThrow(
  ctx: ChatCtx,
  messageId: Id<"projectChatMessages">,
) {
  const message = await ctx.db.get(messageId);
  if (!message) {
    throw notFound(`Project chat message ${messageId} was not found.`);
  }

  return message;
}

export function canDeleteProjectChatMessage(
  message: Pick<Doc<"projectChatMessages">, "authorUserId" | "deletedAt">,
  viewerUserId: Id<"users">,
) {
  if (message.deletedAt !== undefined) {
    return false;
  }

  return message.authorUserId === viewerUserId;
}

export function toProjectChatMessageListItem(
  message: Doc<"projectChatMessages">,
  viewerUserId: Id<"users">,
): ProjectChatMessageListItem {
  const isDeleted = message.deletedAt !== undefined;

  return {
    id: message._id,
    projectId: message.projectId,
    authorUserId: message.authorUserId,
    authorName: message.authorNameSnapshot,
    authorImage: message.authorImageSnapshot ?? null,
    body: isDeleted ? null : message.body,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    deletedAt: message.deletedAt ?? null,
    isDeleted,
    isOwn: message.authorUserId === viewerUserId,
    canDelete: canDeleteProjectChatMessage(message, viewerUserId),
  };
}
