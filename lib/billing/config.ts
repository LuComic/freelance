import type { PlanTier } from "./plans";

export const BILLING_BETA_MODE = true;
export const BILLING_BETA_EFFECTIVE_TIER: PlanTier = "pro";
export const BILLING_BETA_OWNED_PROJECT_LIMIT = 5;
export const BILLING_BETA_DISABLED_MESSAGE =
  "Payments are disabled during beta.";
export const BILLING_BETA_PROJECT_LIMIT_MESSAGE =
  "During beta you can create up to 5 owned projects.";
