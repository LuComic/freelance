import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { invalidState, notFound, unauthorized } from "../lib/errors";
import { assertMaxLength } from "../lib/inputValidation";
import { MAX_IDEA_LENGTH, MAX_OPTIONS_PER_FIELD } from "../../lib/inputLimits";

const FALLBACK_AUTHOR_NAME = "Anonymous";
const ALLOWED_TAGS = ["Bug", "Critical", "Feature", "UI/UX"] as const;

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
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireCurrentAuth(ctx);
    const body = args.body.trim();
    const tags = Array.from(
      new Set(
        args.tags.filter((tag): tag is (typeof ALLOWED_TAGS)[number] =>
          ALLOWED_TAGS.includes(tag as (typeof ALLOWED_TAGS)[number]),
        ),
      ),
    );

    if (body.length === 0) {
      throw invalidState("Feedback idea cannot be empty.");
    }
    if (args.tags.length > MAX_OPTIONS_PER_FIELD) {
      throw invalidState(
        `Feedback ideas can include up to ${MAX_OPTIONS_PER_FIELD} tags.`,
      );
    }

    assertMaxLength(body, MAX_IDEA_LENGTH, "Feedback idea");

    const now = Date.now();

    return ctx.db.insert("betaFeedbackIdeas", {
      body,
      tags,
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
