import { makeFunctionReference } from "convex/server";

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
