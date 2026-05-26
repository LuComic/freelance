"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  MAX_COMPONENTS_PER_PAGE,
  MAX_OWNED_PROJECTS_PER_USER,
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
        className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2 text-left"
        onClick={() => setOpen((prev) => !prev)}
      >
        <ChevronRight
          size={20}
          className={`${open ? "rotate-90" : "rotate-0"}`}
        />
        Limits
      </button>

      {open ? (
        <div className="flex flex-col gap-2 @[40rem]:pl-7 @[40rem]:pb-2">
          <p className="text-(--gray-page)">
            These platform-wide limits help prevent abuse, control Convex usage
            and storage, and keep the app usable as more people join. If you run
            into a real project need that does not fit, contact support at
            lukasjaager@gmail.com.
          </p>
          <p>
            - Users can own up to {MAX_OWNED_PROJECTS_PER_USER} active projects.
          </p>
          <p>- Each project can have up to {MAX_PAGES_PER_PROJECT} pages.</p>
          <p>
            - Each page can have up to {MAX_COMPONENTS_PER_PAGE} components.
          </p>
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
