"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getCookie,
  setCookie,
  SHOW_SUGGESTIONS_COOKIE,
} from "@/app/lib/cookies";

type PreferencesSectionProps = {
  activeSection: string | null;
};

export function PreferencesSection({ activeSection }: PreferencesSectionProps) {
  const [open, setOpen] = useState(activeSection === "preferences");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [hasLoadedPreference, setHasLoadedPreference] = useState(false);

  useEffect(() => {
    const cookieValue = getCookie(SHOW_SUGGESTIONS_COOKIE);

    queueMicrotask(() => {
      if (cookieValue === "false") {
        setShowSuggestions(false);
      }

      setHasLoadedPreference(true);
    });
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setOpen(activeSection === "preferences");
    });
  }, [activeSection]);

  useEffect(() => {
    if (!hasLoadedPreference) return;

    setCookie(SHOW_SUGGESTIONS_COOKIE, String(showSuggestions));
  }, [hasLoadedPreference, showSuggestions]);

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
        Preferences
      </button>

      {open ? (
        <div className="pl-7 flex flex-col gap-2 pb-2">
          <p className="text-(--gray-page)">Suggestions on ctrl/cmd press</p>
          <div className="w-full rounded-md border px-2 py-1 border-(--gray) wrap-break-word">
            {showSuggestions ? "Enabled" : "Disabled"}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={`w-max rounded-md border px-2 py-1 ${
                showSuggestions
                  ? "border-(--accepted-border) bg-(--accepted-bg)/10 hover:bg-(--accepted-bg)/20"
                  : "border-(--gray) hover:bg-(--gray)/20"
              }`}
              onClick={() => setShowSuggestions(true)}
            >
              Show suggestions
            </button>
            <button
              type="button"
              className={`w-max rounded-md border px-2 py-1 ${
                !showSuggestions
                  ? "border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20"
                  : "border-(--gray) hover:bg-(--gray)/20"
              }`}
              onClick={() => setShowSuggestions(false)}
            >
              Don&apos;t show suggestions
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
