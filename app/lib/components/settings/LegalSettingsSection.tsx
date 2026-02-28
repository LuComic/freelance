"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type LegalSettingsSectionProps = {
  activeSection: string | null;
  deleteError: string | null;
  isDeleteConfirming: boolean;
  isDeletingAccount: boolean;
  onDeleteAccount: () => Promise<void>;
};

export function LegalSettingsSection({
  activeSection,
  deleteError,
  isDeleteConfirming,
  isDeletingAccount,
  onDeleteAccount,
}: LegalSettingsSectionProps) {
  const [open, setOpen] = useState(activeSection === "legal");
  const [cookiesAccepted, setCookiesAccepted] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      setOpen(activeSection === "legal");
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
        Legal
      </button>

      {open ? (
        <div className="pl-7 flex flex-col gap-2 pb-2">
          <p className="text-(--gray-page)">Cookies</p>
          <div className="w-full rounded-md border px-2 py-1 border-(--gray) wrap-break-word">
            {cookiesAccepted ? "Accepted" : "Not accepted"}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={`w-max rounded-md border px-2 py-1 ${
                cookiesAccepted
                  ? "border-(--accepted-border) bg-(--accepted-bg)/10 hover:bg-(--accepted-bg)/20"
                  : "border-(--gray) hover:bg-(--gray)/20"
              }`}
              onClick={() => setCookiesAccepted(true)}
            >
              Accept
            </button>
            <button
              type="button"
              className={`w-max rounded-md border px-2 py-1 ${
                !cookiesAccepted
                  ? "border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20"
                  : "border-(--gray) hover:bg-(--gray)/20"
              }`}
              onClick={() => setCookiesAccepted(false)}
            >
              Deny
            </button>
            <Link
              href="/legal/cookies"
              className="w-max rounded-md border px-2 py-1 border-(--gray) hover:bg-(--gray)/20"
            >
              Read cookies
            </Link>
          </div>

          <p className="text-(--gray-page)">Terms of Service</p>
          <div className="w-full rounded-md border px-2 py-1 border-(--gray) wrap-break-word">
            {termsAccepted ? "Accepted" : "Not accepted"}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={`w-max rounded-md border px-2 py-1 ${
                termsAccepted
                  ? "border-(--accepted-border) bg-(--accepted-bg)/10 hover:bg-(--accepted-bg)/20"
                  : "border-(--gray) hover:bg-(--gray)/20"
              }`}
              onClick={() => setTermsAccepted(true)}
            >
              Accept
            </button>
            <button
              type="button"
              className={`w-max rounded-md border px-2 py-1 ${
                !termsAccepted
                  ? "border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20"
                  : "border-(--gray) hover:bg-(--gray)/20"
              }`}
              onClick={() => setTermsAccepted(false)}
            >
              Deny
            </button>
            <Link
              href="/legal/terms"
              className="w-max rounded-md border px-2 py-1 border-(--gray) hover:bg-(--gray)/20"
            >
              Read terms
            </Link>
          </div>

          <p className="text-(--gray-page)">Privacy Policy</p>
          <div className="w-full rounded-md border px-2 py-1 border-(--gray) wrap-break-word">
            {privacyAccepted ? "Accepted" : "Not accepted"}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={`w-max rounded-md border px-2 py-1 ${
                privacyAccepted
                  ? "border-(--accepted-border) bg-(--accepted-bg)/10 hover:bg-(--accepted-bg)/20"
                  : "border-(--gray) hover:bg-(--gray)/20"
              }`}
              onClick={() => setPrivacyAccepted(true)}
            >
              Accept
            </button>
            <button
              type="button"
              className={`w-max rounded-md border px-2 py-1 ${
                !privacyAccepted
                  ? "border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20"
                  : "border-(--gray) hover:bg-(--gray)/20"
              }`}
              onClick={() => setPrivacyAccepted(false)}
            >
              Deny
            </button>
            <Link
              href="/legal/privacy"
              className="w-max rounded-md border px-2 py-1 border-(--gray) hover:bg-(--gray)/20"
            >
              Read policy
            </Link>
          </div>

          <p className="text-(--gray-page)">Delete account</p>
          <button
            type="button"
            className="w-max rounded-md border px-2 py-1 border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20"
            onClick={() => void onDeleteAccount()}
            disabled={isDeletingAccount}
          >
            {isDeletingAccount
              ? "Deleting..."
              : isDeleteConfirming
                ? "Are you sure?"
                : "Delete account"}
          </button>
          {deleteError ? (
            <p className="text-sm text-(--declined-border)">{deleteError}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
