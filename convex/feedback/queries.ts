import { query } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";

const FALLBACK_AUTHOR_NAME = "Anonymous";

export const listIdeas = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireCurrentAuth(ctx);
    const ideas = await ctx.db
      .query("betaFeedbackIdeas")
      .withIndex("by_created_at")
      .order("desc")
      .collect();

    return ideas.map((idea) => ({
      id: idea._id,
      body: idea.body,
      authorUserId: idea.authorUserId,
      authorName: idea.authorNameSnapshot.trim() || FALLBACK_AUTHOR_NAME,
      voteCount: idea.voterUserIds.length,
      hasVoted: idea.voterUserIds.includes(userId),
      isAuthor: idea.authorUserId === userId,
      createdAt: idea.createdAt,
    }));
  },
});
