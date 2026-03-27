"use client";

import { BILLING_PLAN_ORDER, type PlanTier } from "@/lib/billing/plans";
import {
  cancelCurrentPlanAction,
  currentEntitlementsQuery,
  openBillingPortalAction,
  reactivateCurrentPlanAction,
  startCheckoutAction,
} from "@/lib/convexFunctionReferences";
import { ChevronRight } from "lucide-react";
import { useAction, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";

type PlanSettingsSectionProps = {
  activeSection: string | null;
};

function formatPeriodEndDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp * 1000));
}

export function PlanSettingsSection({
  activeSection,
}: PlanSettingsSectionProps) {
  const entitlements = useQuery(currentEntitlementsQuery, {});
  const startCheckout = useAction(startCheckoutAction);
  const openBillingPortal = useAction(openBillingPortalAction);
  const cancelCurrentPlan = useAction(cancelCurrentPlanAction);
  const reactivateCurrentPlan = useAction(reactivateCurrentPlanAction);
  const [open, setOpen] = useState(activeSection === "plan");
  const [pendingAction, setPendingAction] = useState<
    PlanTier | "portal" | null
  >(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setOpen(activeSection === "plan");
    });
  }, [activeSection]);

  const currentTier = (entitlements?.plan.tier ?? "free") as PlanTier;
  const starterUsageLabel =
    entitlements?.ownedProjectLimit === 3
      ? ` (${entitlements.ownedProjectCount}/3)`
      : "";
  const currentSubscription = entitlements?.subscription ?? null;
  const currentPlanSummary = useMemo(() => {
    if (!currentSubscription?.cancelAtPeriodEnd) {
      return null;
    }

    return `Access ends ${formatPeriodEndDate(currentSubscription.currentPeriodEnd)}.`;
  }, [currentSubscription]);

  const handlePlanAction = async (targetTier: PlanTier) => {
    if (targetTier === "free") {
      return;
    }

    setActionError(null);

    try {
      if (currentTier === targetTier) {
        setPendingAction(targetTier);

        if (currentSubscription?.cancelAtPeriodEnd) {
          await reactivateCurrentPlan({});
        } else {
          await cancelCurrentPlan({});
        }
        return;
      }

      if (currentTier === "free") {
        setPendingAction(targetTier);
        const result = await startCheckout({ targetTier });

        if (!result?.url) {
          throw new Error("Stripe Checkout did not return a URL.");
        }

        window.location.assign(result.url);
        return;
      }

      setPendingAction("portal");
      const result = await openBillingPortal({});

      if (!result?.url) {
        throw new Error("Stripe Billing Portal did not return a URL.");
      }

      window.location.assign(result.url);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not update your plan.",
      );
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="w-full p-2 flex flex-col gap-2 bg-(--gray)/10">
      <button
        type="button"
        className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
        onClick={() => setOpen((prev) => !prev)}
      >
        <ChevronRight
          size={20}
          className={`${open ? "rotate-90" : "rotate-0"}`}
        />
        Plan
      </button>
      {open ? (
        <div className="pl-7 flex flex-col gap-2 pb-2">
          <p className="text-(--gray-page)">
            No payments required - limited testing version. Limited to 5
            projects
          </p>
        </div>
      ) : null}
      {/* {open ? (
        <div className="pl-7 flex flex-col gap-2 pb-2">
          <div className="flex flex-col @[40rem]:grid gap-3 grid-cols-3">
            {BILLING_PLAN_ORDER.map((plan) => {
              const current = currentTier === plan.tier;
              const buttonLabel =
                plan.tier === "free"
                  ? null
                  : current
                    ? currentSubscription?.cancelAtPeriodEnd
                      ? "Resume Plan"
                      : "Cancel Plan"
                    : currentTier === "free"
                      ? "Choose Plan"
                      : "Switch Plan";
              const isBusy =
                pendingAction === plan.tier ||
                (!current && pendingAction === "portal");

              return (
                <div
                  key={plan.tier}
                  className={`relative h-full overflow-hidden rounded-lg flex flex-col gap-4 border bg-(--darkest) py-3 px-3.5 ${current ? "border-(--vibrant)" : "border-(--gray)"}`}
                >
                  {plan.tier === "pro" ? (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
                    >
                      <svg
                        viewBox="0 0 900 600"
                        className="absolute -right-50 -top-36 h-140 w-120 blur-3xl opacity-40"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                      >
                        <g transform="translate(420.69996617713275 327.69466148331287) scale(0.82 1.35)">
                          <path
                            d="M88.4 -150.2C122.3 -115.7 163.1 -104.4 190.9 -77.3C218.7 -50.1 233.5 -7.2 232.3 36.7C231.1 80.6 213.8 125.4 183.8 158.2C153.7 190.9 111 211.6 70.8 208.4C30.6 205.3 -6.9 178.5 -49 166.4C-91.1 154.3 -137.8 157.1 -158.7 135.9C-179.7 114.7 -175 69.6 -167 32.6C-159 -4.5 -147.7 -33.4 -143.6 -75.2C-139.4 -117 -142.4 -171.6 -119.7 -211.3C-97 -250.9 -48.5 -275.4 -10.6 -258.9C27.2 -242.3 54.4 -184.7 88.4 -150.2"
                            fill="#0061ff"
                          />
                        </g>
                      </svg>
                    </div>
                  ) : null}
                  <div className="relative z-10 flex h-full flex-col gap-4">
                    <div className="flex flex-1 flex-col gap-4">
                      <p className="font-medium">
                        {plan.name}{" "}
                        {current ? (
                          <span className="text-(--vibrant)">Current Plan</span>
                        ) : null}
                      </p>
                      <p className="leading-7 text-(--gray-page)">
                        {plan.description}
                      </p>

                      <p className="text-3xl font-semibold">
                        {plan.priceLabel}
                        <span className="text-base font-medium text-(--gray-page)">
                          /mo
                        </span>
                      </p>

                      <ul className="space-y-2 leading-7 text-(--gray-page)">
                        {plan.features.map((feature) => (
                          <li key={feature}>
                            {plan.tier === "starter" &&
                            feature === "Create up to 3 projects"
                              ? `${feature}${starterUsageLabel}`
                              : feature}
                          </li>
                        ))}
                      </ul>

                      {plan.footer ? (
                        <p className="font-medium">{plan.footer}</p>
                      ) : null}
                      {current && currentPlanSummary ? (
                        <p className="text-sm text-(--gray-page)">
                          {currentPlanSummary}
                        </p>
                      ) : null}
                    </div>
                    {buttonLabel ? (
                      <button
                        type="button"
                        disabled={entitlements === undefined || isBusy}
                        className={`rounded-md ${current ? "bg-(--vibrant)" : "border border-(--gray)"} px-1.5 py-1 font-medium ${current ? "hover:bg-(--vibrant-hover)" : "hover:bg-(--gray)/10"} disabled:cursor-not-allowed disabled:opacity-60`}
                        onClick={() => void handlePlanAction(plan.tier)}
                      >
                        {isBusy ? "Working..." : buttonLabel}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          {actionError ? (
            <p className="text-(--declined-border)">{actionError}</p>
          ) : null}
        </div>
      ) : null} */}
    </div>
  );
}
