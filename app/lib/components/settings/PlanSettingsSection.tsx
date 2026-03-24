"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type PricingPlan = {
  name: string;
  description: string;
  price: string;
  features: string[];
  footer?: string;
  borderClassName: string;
};

const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    description: "Join projects as a client or co-creator.",
    price: "$0",
    features: ["Join shared projects", "Co-create in invited projects"],
    borderClassName: "border-(--gray)",
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
    borderClassName: "border-(--gray)",
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
    borderClassName: "border-(--vibrant)",
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
          <div className="flex flex-col md:grid gap-4 grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg border bg-(--darkest) py-3 px-3.5 ${plan.borderClassName}`}
              >
                <p className="font-medium">{plan.name}</p>
                <p className="mt-3 leading-7 text-(--gray-page)">
                  {plan.description}
                </p>

                <p className="mt-5 text-3xl font-semibold">
                  {plan.price}
                  <span className="text-base font-medium text-(--gray-page)">
                    /mo
                  </span>
                </p>

                <ul className="mt-5 space-y-2 leading-7 text-(--gray-page)">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>

                {plan.footer ? (
                  <p className="mt-5 font-medium">{plan.footer}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
