import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { requireProjectMember } from "../lib/permissions";
import {
  getProjectChatAuthorRole,
  toProjectChatMessageListItem,
} from "./model";

export const listProjectMessages = query({
  args: {
    projectId: v.id("projects"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    await requireProjectMember(ctx, args.projectId, userId);

    const messages = await ctx.db
      .query("projectChatMessages")
      .withIndex("by_project_created", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...messages,
      page: await Promise.all(
        messages.page.map(async (message) =>
          toProjectChatMessageListItem(
            message,
            userId,
            await getProjectChatAuthorRole(
              ctx,
              args.projectId,
              message.authorUserId,
            ),
          ),
        ),
      ),
    };
  },
});
