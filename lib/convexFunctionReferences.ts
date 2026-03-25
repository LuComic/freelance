import { makeFunctionReference } from "convex/server";

export const currentEntitlementsQuery =
  makeFunctionReference<"query">("billing/queries:currentEntitlements");
export const startCheckoutAction =
  makeFunctionReference<"action">("billing/actions:startCheckout");
export const openBillingPortalAction =
  makeFunctionReference<"action">("billing/actions:openBillingPortal");
export const cancelCurrentPlanAction =
  makeFunctionReference<"action">("billing/actions:cancelCurrentPlan");
export const reactivateCurrentPlanAction =
  makeFunctionReference<"action">("billing/actions:reactivateCurrentPlan");
