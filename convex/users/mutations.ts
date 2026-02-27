import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { mutation } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { invalidState } from "../lib/errors";

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireCurrentAuth(ctx);

    if (args.name === undefined && args.bio === undefined) {
      throw invalidState("At least one profile field must be provided.");
    }

    const patch: Partial<Doc<"users">> = {};

    if (args.name !== undefined) {
      const trimmedName = args.name.trim();
      if (!trimmedName) {
        throw invalidState("Name cannot be empty.");
      }

      if (user.name !== trimmedName) {
        patch.name = trimmedName;
      }
    }

    if (args.bio !== undefined) {
      const trimmedBio = args.bio.trim();
      const nextBio = trimmedBio || undefined;

      if (user.bio !== nextBio) {
        patch.bio = nextBio;
      }
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(userId, patch);
    }
  },
});
