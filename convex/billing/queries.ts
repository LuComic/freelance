import { query } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { APP_ERROR_CODES, ConvexDomainError } from "../lib/errors";
import { getCurrentEntitlementsForUser } from "./model";

export const currentEntitlements = query({
  args: {},
  handler: async (ctx) => {
    try {
      const { userId } = await requireCurrentAuth(ctx);
      return await getCurrentEntitlementsForUser(ctx, userId);
    } catch (error) {
      if (
        error instanceof ConvexDomainError &&
        (error.code === APP_ERROR_CODES.notFound ||
          error.code === APP_ERROR_CODES.unauthorized)
      ) {
        return null;
      }

      throw error;
    }
  },
});
