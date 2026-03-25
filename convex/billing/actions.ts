"use node";

import { StripeSubscriptions } from "@convex-dev/stripe";
import { getAuthUserId } from "@convex-dev/auth/server";
import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { components } from "../_generated/api";
import { getAppUrl, getStripePriceIdForTier } from "./model";

const stripeComponent = (components as { stripe?: unknown }).stripe;
const currentEntitlementsQuery = makeFunctionReference<"query">(
  "billing/queries:currentEntitlements",
);
const stripeClient = new StripeSubscriptions(
  stripeComponent as ConstructorParameters<typeof StripeSubscriptions>[0],
  {},
);

export const startCheckout = action({
  args: {
    targetTier: v.union(v.literal("starter"), v.literal("pro")),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ sessionId: string; url: string | null }> => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated.");
    }

    const [profile, entitlements] = await Promise.all([
      ctx.runQuery(api.users.queries.currentProfile, {}),
      ctx.runQuery(currentEntitlementsQuery, {}),
    ]);

    if (!entitlements) {
      throw new Error("Could not resolve your current plan.");
    }

    if (entitlements.plan.tier !== "free") {
      throw new Error(
        "Use the billing portal to switch or manage an existing paid plan.",
      );
    }

    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: String(userId),
      email: profile?.email ?? undefined,
      name: profile?.name ?? undefined,
    });
    const appUrl = getAppUrl();

    return await stripeClient.createCheckoutSession(ctx, {
      priceId: getStripePriceIdForTier(args.targetTier),
      customerId: customer.customerId,
      mode: "subscription",
      successUrl: `${appUrl}/settings?section=plan&billing=success`,
      cancelUrl: `${appUrl}/settings?section=plan&billing=canceled`,
      metadata: {
        userId: String(userId),
        targetTier: args.targetTier,
      },
      subscriptionMetadata: {
        userId: String(userId),
        targetTier: args.targetTier,
      },
    });
  },
});

export const openBillingPortal = action({
  args: {},
  handler: async (ctx): Promise<{ url: string }> => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated.");
    }

    const entitlements = await ctx.runQuery(currentEntitlementsQuery, {});

    if (!entitlements?.subscription) {
      throw new Error("No paid subscription was found for this account.");
    }

    return await stripeClient.createCustomerPortalSession(ctx, {
      customerId: entitlements.subscription.stripeCustomerId,
      returnUrl: `${getAppUrl()}/settings?section=plan`,
    });
  },
});

export const cancelCurrentPlan = action({
  args: {},
  handler: async (ctx): Promise<null> => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated.");
    }

    const entitlements = await ctx.runQuery(currentEntitlementsQuery, {});

    if (!entitlements?.subscription) {
      throw new Error("No paid subscription was found for this account.");
    }

    await stripeClient.cancelSubscription(ctx, {
      stripeSubscriptionId: entitlements.subscription.stripeSubscriptionId,
      cancelAtPeriodEnd: true,
    });

    return null;
  },
});

export const reactivateCurrentPlan = action({
  args: {},
  handler: async (ctx): Promise<null> => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated.");
    }

    const entitlements = await ctx.runQuery(currentEntitlementsQuery, {});

    if (!entitlements?.subscription) {
      throw new Error("No paid subscription was found for this account.");
    }

    if (!entitlements.subscription.cancelAtPeriodEnd) {
      throw new Error("This subscription is not scheduled to cancel.");
    }

    await stripeClient.reactivateSubscription(ctx, {
      stripeSubscriptionId: entitlements.subscription.stripeSubscriptionId,
    });

    return null;
  },
});
