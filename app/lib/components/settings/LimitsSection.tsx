"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  BILLING_BETA_MODE,
  BILLING_BETA_OWNED_PROJECT_LIMIT,
} from "@/lib/billing/config";
import {
  MAX_COMPONENTS_PER_PAGE,
  MAX_PAGE_CONTENT_BYTES,
  MAX_PAGES_PER_PROJECT,
  PAGE_CONTENT_WARNING_BYTES,
} from "@/lib/pageLimits";

type LimitsSettingsSectionProps = {
  activeSection: string | null;
};

export function LimitsSettingsSection({
  activeSection,
}: LimitsSettingsSectionProps) {
  const [open, setOpen] = useState(activeSection === "limits");
  const warningKilobytes = PAGE_CONTENT_WARNING_BYTES / 1024;
  const maxContentKilobytes = MAX_PAGE_CONTENT_BYTES / 1024;

  useEffect(() => {
    queueMicrotask(() => {
      setOpen(activeSection === "limits");
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
        Limits
      </button>

      {open ? (
        <div className="pl-7 flex flex-col gap-2 pb-2">
          <p className="text-(--gray-page)">
            Although Pro users get a lot more access, there still need to be
            some limitations. These are for preventing spam, saving storage and
            keeping up with the user base (if the project will even have that
            problem). If you find these too limiting, contact support at
            hello@gmail.com
          </p>
          {BILLING_BETA_MODE && BILLING_BETA_OWNED_PROJECT_LIMIT !== null ? (
            <p>
              - During beta, users are limited to{" "}
              {BILLING_BETA_OWNED_PROJECT_LIMIT} projects.
            </p>
          ) : null}
          <p>- Projects are limited to {MAX_PAGES_PER_PROJECT} pages.</p>
          <p>- Pages are limited to {MAX_COMPONENTS_PER_PAGE} components.</p>
          <p>
            - Try to keep page content around {warningKilobytes} KB or smaller.
          </p>
          <p>
            - Page saves stop at {maxContentKilobytes} KB of serialized content.
          </p>
        </div>
      ) : null}
    </div>
  );
}
