import type { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { components } from "../_generated/api";
import {
  BILLING_BETA_EFFECTIVE_TIER,
  BILLING_BETA_MODE,
  BILLING_BETA_OWNED_PROJECT_LIMIT,
  BILLING_BETA_PROJECT_LIMIT_MESSAGE,
} from "../../lib/billing/config";
import type { PlanTier } from "../../lib/billing/plans";
import { getBillingPlan } from "../../lib/billing/plans";

type SubscriptionRecord = {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  priceId: string;
  quantity?: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  metadata?: unknown;
  userId?: string;
  orgId?: string;
};

type BillingCtx = QueryCtx | MutationCtx | ActionCtx;

const stripeComponent = components.stripe;
const ENTITLED_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
]);
const PLAN_PRIORITY: Record<PlanTier, number> = {
  free: 0,
  starter: 1,
  pro: 2,
};

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is not set.`);
  }

  return value;
}

function getPlanTierByPriceId(priceId: string): PlanTier | null {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    return "pro";
  }

  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
    return "starter";
  }

  return null;
}

function compareSubscriptions(
  left: SubscriptionRecord,
  right: SubscriptionRecord,
) {
  const leftTier = getPlanTierByPriceId(left.priceId) ?? "free";
  const rightTier = getPlanTierByPriceId(right.priceId) ?? "free";
  const leftPriority = PLAN_PRIORITY[leftTier];
  const rightPriority = PLAN_PRIORITY[rightTier];

  if (leftPriority !== rightPriority) {
    return rightPriority - leftPriority;
  }

  return right.currentPeriodEnd - left.currentPeriodEnd;
}

export function getAppUrl() {
  return requireEnv("APP_URL");
}

export function getStripePriceIdForTier(tier: Exclude<PlanTier, "free">) {
  if (tier === "starter") {
    return requireEnv("STRIPE_STARTER_PRICE_ID");
  }

  return requireEnv("STRIPE_PRO_PRICE_ID");
}

export async function listUserPlanSubscriptions(
  ctx: BillingCtx,
  userId: Id<"users"> | string,
) {
  if (!stripeComponent) {
    return [] as SubscriptionRecord[];
  }

  const subscriptions = (await ctx.runQuery(
    stripeComponent.public.listSubscriptionsByUserId,
    { userId: String(userId) },
  )) as SubscriptionRecord[];

  return subscriptions
    .filter((subscription) => {
      const tier = getPlanTierByPriceId(subscription.priceId);

      return (
        tier !== null && ENTITLED_SUBSCRIPTION_STATUSES.has(subscription.status)
      );
    })
    .sort(compareSubscriptions);
}

export async function getCurrentPlanSubscription(
  ctx: BillingCtx,
  userId: Id<"users"> | string,
) {
  const [subscription] = await listUserPlanSubscriptions(ctx, userId);
  return subscription ?? null;
}

export async function getOwnedProjectCount(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
) {
  const projects = await ctx.db
    .query("projects")
    .withIndex("by_owner", (query) => query.eq("ownerId", userId))
    .collect();

  return projects.filter((project) => project.isArchived !== true).length;
}

export async function getCurrentEntitlementsForUser(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
) {
  const ownedProjectCount = await getOwnedProjectCount(ctx, userId);

  if (BILLING_BETA_MODE) {
    const canCreateOwnedProjects =
      ownedProjectCount < BILLING_BETA_OWNED_PROJECT_LIMIT;

    return {
      plan: {
        tier: BILLING_BETA_EFFECTIVE_TIER,
        name: "Beta",
        description:
          "All paid features are unlocked during the testing period.",
        priceLabel: "$0",
        footer: "Limited to 5 owned projects during beta.",
      },
      features: [
        "Create up to 5 projects during beta",
        "All components included",
        "Analytics included",
      ],
      ownedProjectCount,
      ownedProjectLimit: BILLING_BETA_OWNED_PROJECT_LIMIT,
      canCreateOwnedProjects,
      createProjectMessage: canCreateOwnedProjects
        ? null
        : BILLING_BETA_PROJECT_LIMIT_MESSAGE,
      canAccessAnalytics: true,
      canUseLimitedComponents: true,
      subscription: null,
    };
  }

  const subscription = await getCurrentPlanSubscription(ctx, userId);
  const planTier = subscription
    ? (getPlanTierByPriceId(subscription.priceId) ?? "free")
    : "free";
  const plan = getBillingPlan(planTier);
  const ownedProjectLimit = plan.ownedProjectLimit;
  const canCreateOwnedProjects =
    ownedProjectLimit === null ? true : ownedProjectCount < ownedProjectLimit;
  let createProjectMessage: string | null = null;

  if (!canCreateOwnedProjects) {
    createProjectMessage =
      planTier === "free"
        ? "Upgrade to Starter to create your own projects."
        : "Starter includes up to 3 owned projects. Upgrade to Pro to create more.";
  }

  return {
    plan: {
      tier: plan.tier,
      name: plan.name,
      description: plan.description,
      priceLabel: plan.priceLabel,
      footer: plan.footer ?? null,
    },
    features: plan.features,
    ownedProjectCount,
    ownedProjectLimit,
    canCreateOwnedProjects,
    createProjectMessage,
    canAccessAnalytics: plan.canAccessAnalytics,
    canUseLimitedComponents: plan.canUseLimitedComponents,
    subscription: subscription
      ? {
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          stripeCustomerId: subscription.stripeCustomerId,
          status: subscription.status,
          priceId: subscription.priceId,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        }
      : null,
  };
}
