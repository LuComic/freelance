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
    price: "$5",
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
    price: "$15",
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
  const hasPlan = 1;

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
            {pricingPlans.map((plan, index) => {
              const current: boolean = hasPlan === index;
              return (
                <div
                  key={plan.name}
                  className={`relative h-full overflow-hidden rounded-lg flex flex-col gap-4 border bg-(--darkest) py-3 px-3.5 ${current ? "border-(--vibrant)" : "border-(--gray)"}`}
                >
                  {plan.name === "Pro Unlimited" ? (
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
                    {index !== 0 ? (
                      <button
                        className={`rounded-md ${current ? "bg-(--vibrant)" : "border border-(--gray)"} px-1.5 py-1 font-medium ${current ? "hover:bg-(--vibrant-hover)" : "hover:bg-(--gray)/10"}`}
                      >
                        {hasPlan === index ? "Cancel Plan" : "Choose Plan"}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
