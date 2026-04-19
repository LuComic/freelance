import { makeFunctionReference } from "convex/server";

export const currentEntitlementsQuery = makeFunctionReference<"query">(
  "billing/queries:currentEntitlements",
);
export const betaFeedbackIdeasQuery = makeFunctionReference<"query">(
  "feedback/queries:listIdeas",
);
export const submitBetaFeedbackIdeaMutation = makeFunctionReference<"mutation">(
  "feedback/mutations:submitIdea",
);
export const toggleBetaFeedbackIdeaVoteMutation =
  makeFunctionReference<"mutation">("feedback/mutations:toggleIdeaVote");
export const deleteBetaFeedbackIdeaMutation = makeFunctionReference<"mutation">(
  "feedback/mutations:deleteIdea",
);
export const getViewerFormSubmissionQuery = makeFunctionReference<"query">(
  "pageRuntime/forms:getViewerFormSubmission",
);
export const submitFormMutation = makeFunctionReference<"mutation">(
  "pageRuntime/forms:submitForm",
);
export const startCheckoutAction = makeFunctionReference<"action">(
  "billing/actions:startCheckout",
);
export const openBillingPortalAction = makeFunctionReference<"action">(
  "billing/actions:openBillingPortal",
);
export const cancelCurrentPlanAction = makeFunctionReference<"action">(
  "billing/actions:cancelCurrentPlan",
);
export const reactivateCurrentPlanAction = makeFunctionReference<"action">(
  "billing/actions:reactivateCurrentPlan",
);
