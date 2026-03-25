export const PLAN_TIERS = ["free", "starter", "pro"] as const;

export type PlanTier = (typeof PLAN_TIERS)[number];

export type BillingPlanDefinition = {
  tier: PlanTier;
  name: string;
  description: string;
  priceLabel: string;
  features: readonly string[];
  footer?: string;
  ownedProjectLimit: number | null;
  canAccessAnalytics: boolean;
  canUseLimitedComponents: boolean;
};

export const BILLING_PLANS: Record<PlanTier, BillingPlanDefinition> = {
  free: {
    tier: "free",
    name: "Free",
    description: "Join projects as a client or co-creator.",
    priceLabel: "$0",
    features: [
      "Join shared projects",
      "Core components included",
      "Co-create in invited projects",
    ],
    ownedProjectLimit: 0,
    canAccessAnalytics: false,
    canUseLimitedComponents: false,
  },
  starter: {
    tier: "starter",
    name: "Starter",
    description: "For getting started with your own work.",
    priceLabel: "$5",
    features: [
      "Create up to 3 projects",
      "Core components included",
      "Client sharing and feedback",
    ],
    footer: "Best place to start",
    ownedProjectLimit: 3,
    canAccessAnalytics: true,
    canUseLimitedComponents: false,
  },
  pro: {
    tier: "pro",
    name: "Pro Unlimited",
    description: "For active freelancers and small teams shipping often.",
    priceLabel: "$15",
    features: [
      "Unlimited projects",
      "All components included",
      "Early access to upcoming features",
    ],
    footer: "Best value for regular use",
    ownedProjectLimit: null,
    canAccessAnalytics: true,
    canUseLimitedComponents: true,
  },
};

export const BILLING_PLAN_ORDER: readonly BillingPlanDefinition[] = [
  BILLING_PLANS.free,
  BILLING_PLANS.starter,
  BILLING_PLANS.pro,
];

export function getBillingPlan(tier: PlanTier) {
  return BILLING_PLANS[tier];
}

export function isPaidPlanTier(tier: PlanTier) {
  return tier === "starter" || tier === "pro";
}

