"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type PricingPlan = {
  name: string;
  description: string;
  price: string;
  features: string[];
  footer?: string;
};

const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    description: "Join projects as a client or co-creator.",
    price: "$0",
    features: ["Join shared projects", "Co-create in invited projects"],
  },
  {
    name: "Starter",
    description: "For getting started with your own work.",
    price: "$11.99",
    features: [
      "Create up to 3 projects",
      "Core components included",
      "Client sharing and feedback",
    ],
    footer: "Best place to start",
  },
  {
    name: "Pro Unlimited",
    description: "For active freelancers and small teams shipping often.",
    price: "$14.99",
    features: [
      "Unlimited projects",
      "All components included",
      "Early access to upcoming features",
    ],
    footer: "Best value for regular use",
  },
];

type PlanSettingsSectionProps = {
  activeSection: string | null;
};

export function PlanSettingsSection({
  activeSection,
}: PlanSettingsSectionProps) {
  const [open, setOpen] = useState(activeSection === "plan");

  useEffect(() => {
    queueMicrotask(() => {
      setOpen(activeSection === "plan");
    });
  }, [activeSection]);

  // For this simple hardcoded data this is the plan's index the user has (0-2)
  const hasPlan = 0;

  return (
    <div className="w-full p-2 flex flex-col gap-2">
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
          <div className="flex flex-col md:grid gap-3 grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <div
                key={plan.name}
                className={`rounded-lg flex flex-col gap-4 border bg-(--darkest) py-3 px-3.5 ${hasPlan === index ? "border-(--vibrant)" : "border-(--gray)"}`}
              >
                <p className="font-medium">
                  {plan.name}{" "}
                  {hasPlan === index ? (
                    <span className="text-(--vibrant)">Current Plan</span>
                  ) : null}
                </p>
                <p className="leading-7 text-(--gray-page)">
                  {plan.description}
                </p>

                <p className="text-3xl font-semibold">
                  {plan.price}
                  <span className="text-base font-medium text-(--gray-page)">
                    /mo
                  </span>
                </p>

                <ul className="space-y-2 leading-7 text-(--gray-page)">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>

                {plan.footer ? (
                  <p className="font-medium">{plan.footer}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
