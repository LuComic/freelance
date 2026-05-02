import { makeFunctionReference } from "convex/server";

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
export const listProjectChatMessagesQuery = makeFunctionReference<"query">(
  "chat/queries:listProjectMessages",
);
export const sendProjectChatMessageMutation = makeFunctionReference<"mutation">(
  "chat/mutations:sendProjectMessage",
);
export const deleteProjectChatMessageMutation =
  makeFunctionReference<"mutation">("chat/mutations:deleteProjectMessage");
