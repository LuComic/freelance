import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { invalidState, notFound, unauthorized } from "../lib/errors";

const MAX_IDEA_LENGTH = 280;
const FALLBACK_AUTHOR_NAME = "Anonymous";

function getAuthorName(name?: string | null) {
  const trimmedName = name?.trim();
  if (trimmedName) {
    return trimmedName;
  }

  return FALLBACK_AUTHOR_NAME;
}

export const submitIdea = mutation({
  args: {
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireCurrentAuth(ctx);
    const body = args.body.trim();

    if (body.length === 0) {
      throw invalidState("Feedback idea cannot be empty.");
    }

    if (body.length > MAX_IDEA_LENGTH) {
      throw invalidState(
        `Feedback idea cannot be longer than ${MAX_IDEA_LENGTH} characters.`,
      );
    }

    const now = Date.now();

    return ctx.db.insert("betaFeedbackIdeas", {
      body,
      authorUserId: userId,
      authorNameSnapshot: getAuthorName(user.name),
      voterUserIds: [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const toggleIdeaVote = mutation({
  args: {
    ideaId: v.id("betaFeedbackIdeas"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const idea = await ctx.db.get(args.ideaId);

    if (!idea) {
      throw notFound(`Feedback idea ${args.ideaId} was not found.`);
    }

    const currentVoterIds = Array.from(new Set(idea.voterUserIds));
    const hasVoted = currentVoterIds.includes(userId);
    const voterUserIds = hasVoted
      ? currentVoterIds.filter((voterUserId) => voterUserId !== userId)
      : [...currentVoterIds, userId];

    await ctx.db.patch(args.ideaId, {
      voterUserIds,
      updatedAt: Date.now(),
    });
  },
});

export const deleteIdea = mutation({
  args: {
    ideaId: v.id("betaFeedbackIdeas"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const idea = await ctx.db.get(args.ideaId);

    if (!idea) {
      throw notFound(`Feedback idea ${args.ideaId} was not found.`);
    }

    if (idea.authorUserId !== userId) {
      throw unauthorized("Only the idea author can delete this feedback.");
    }

    await ctx.db.delete(args.ideaId);
  },
});
