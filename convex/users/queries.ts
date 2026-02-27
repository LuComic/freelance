import type { Doc, Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";

export type CurrentProfile = {
  id: Id<"users">;
  name: string | null;
  email: string | null;
  bio: string | null;
  image: string | null;
};

function toCurrentProfile(user: Doc<"users">): CurrentProfile {
  return {
    id: user._id,
    name: user.name ?? null,
    email: user.email ?? null,
    bio: user.bio ?? null,
    image: user.image ?? null,
  };
}

export const currentProfile = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireCurrentAuth(ctx);
    return toCurrentProfile(user);
  },
});
