import type { PlanTier } from "./plans";

export const BILLING_BETA_MODE = true;
export const BILLING_BETA_EFFECTIVE_TIER: PlanTier = "pro";
export const BILLING_BETA_OWNED_PROJECT_LIMIT: number | null = null;
export const BILLING_BETA_DISABLED_MESSAGE =
  "Payments are disabled during beta.";
