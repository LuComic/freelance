import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { invalidState } from "./errors";
import { deleteGuestUserData } from "./userCleanup";

export function isAnonymousUser(
  user: Pick<Doc<"users">, "isAnonymous"> | null | undefined,
) {
  return user?.isAnonymous === true;
}

export function assertNonAnonymousUser(
  user: Pick<Doc<"users">, "isAnonymous">,
  message = "Guest accounts can't use this feature.",
) {
  if (isAnonymousUser(user)) {
    throw invalidState(message);
  }
}

export async function deleteGuestUser(
  ctx: MutationCtx,
  guestUserId: Id<"users">,
) {
  const guestUser = await ctx.db.get(guestUserId);

  if (!guestUser || guestUser.isAnonymous !== true) {
    return;
  }

  await deleteGuestUserData(ctx, guestUserId);
}
