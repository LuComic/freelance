import { query } from "../_generated/server";
import { v } from "convex/values";
import { isBetaAllowlistedEmail } from "../lib/betaAccess";

export const isEmailAllowedForSignup = query({
  args: {
    email: v.string(),
  },
  handler: async (_ctx, args) => {
    return isBetaAllowlistedEmail(args.email);
  },
});
