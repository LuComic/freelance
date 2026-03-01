import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { buildUserSearchText } from "./users/model";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      const user = await ctx.db.get(userId);
      if (!user) {
        return;
      }

      const searchText = buildUserSearchText(user);
      if (user.searchText !== searchText) {
        await ctx.db.patch(userId, { searchText });
      }
    },
  },
});
