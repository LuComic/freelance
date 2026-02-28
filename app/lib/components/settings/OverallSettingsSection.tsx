"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type OverallSettingsSectionProps = {
  activeSection: string | null;
};

export function OverallSettingsSection({
  activeSection,
}: OverallSettingsSectionProps) {
  const [open, setOpen] = useState(activeSection === "overall");
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      setOpen(activeSection === "overall");
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
        Overall
      </button>

      {open ? (
        <div className="pl-7 flex flex-col gap-2 pb-2">
          <p className="text-(--gray-page)">Email notifications</p>
          <div className="w-full rounded-md border px-2 py-1 border-(--gray) wrap-break-word">
            {emailNotificationsEnabled ? "Enabled" : "Disabled"}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={`w-max rounded-md border px-2 py-1 ${
                emailNotificationsEnabled
                  ? "border-(--accepted-border) bg-(--accepted-bg)/10 hover:bg-(--accepted-bg)/20"
                  : "border-(--gray) hover:bg-(--gray)/20"
              }`}
              onClick={() => setEmailNotificationsEnabled(true)}
            >
              Enable
            </button>
            <button
              type="button"
              className={`w-max rounded-md border px-2 py-1 ${
                !emailNotificationsEnabled
                  ? "border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20"
                  : "border-(--gray) hover:bg-(--gray)/20"
              }`}
              onClick={() => setEmailNotificationsEnabled(false)}
            >
              Disable
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
