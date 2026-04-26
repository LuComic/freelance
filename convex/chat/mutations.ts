import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { buildUserDisplayName } from "../connections/model";
import { requireCurrentAuth } from "../lib/auth";
import { invalidState, notFound, unauthorized } from "../lib/errors";
import { assertMaxLength } from "../lib/inputValidation";
import { requireProjectMember } from "../lib/permissions";
import {
  PROJECT_CHAT_MESSAGE_MAX_LENGTH,
  PROJECT_CHAT_RATE_LIMIT_COUNT,
  PROJECT_CHAT_RATE_LIMIT_WINDOW_MS,
  canDeleteProjectChatMessage,
  getProjectChatMessageOrThrow,
} from "./model";

export const sendProjectMessage = mutation({
  args: {
    projectId: v.id("projects"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireCurrentAuth(ctx);
    await requireProjectMember(ctx, args.projectId, userId);

    const body = args.body.trim();
    if (!body) {
      throw invalidState("Message can't be empty.");
    }
    assertMaxLength(body, PROJECT_CHAT_MESSAGE_MAX_LENGTH, "Message");

    const now = Date.now();
    const recentMessages = await ctx.db
      .query("projectChatMessages")
      .withIndex("by_project_author_created", (q) =>
        q
          .eq("projectId", args.projectId)
          .eq("authorUserId", userId)
          .gte("createdAt", now - PROJECT_CHAT_RATE_LIMIT_WINDOW_MS),
      )
      .take(PROJECT_CHAT_RATE_LIMIT_COUNT);

    if (recentMessages.length >= PROJECT_CHAT_RATE_LIMIT_COUNT) {
      throw invalidState("You're sending messages too quickly.");
    }

    return await ctx.db.insert("projectChatMessages", {
      projectId: args.projectId,
      authorUserId: userId,
      authorNameSnapshot: buildUserDisplayName(user),
      authorImageSnapshot: user.image,
      body,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteProjectMessage = mutation({
  args: {
    projectId: v.id("projects"),
    messageId: v.id("projectChatMessages"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    await requireProjectMember(ctx, args.projectId, userId);
    const message = await getProjectChatMessageOrThrow(ctx, args.messageId);

    if (message.projectId !== args.projectId) {
      throw notFound(`Project chat message ${args.messageId} was not found.`);
    }

    if (!canDeleteProjectChatMessage(message, userId)) {
      throw unauthorized("You can't delete this message.");
    }

    const now = Date.now();
    await ctx.db.patch(message._id, {
      deletedAt: now,
      deletedByUserId: userId,
      updatedAt: now,
    });
  },
});
