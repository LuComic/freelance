"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export function SettingsSections() {
  const searchParams = useSearchParams();
  const section = searchParams.get("section");

  const [overallOpen, setOverallOpen] = useState(section === "overall");
  const [accountOpen, setAccountOpen] = useState(section === "account");
  const [legalOpen, setLegalOpen] = useState(section === "legal");

  useEffect(() => {
    setOverallOpen(section === "overall");
    setAccountOpen(section === "account");
    setLegalOpen(section === "legal");
  }, [section]);

  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(true);
  const [newsletterEnabled, setNewsletterEnabled] = useState(true);

  const [username, setUsername] = useState("ainurakk");
  const [newUsername, setNewUsername] = useState("");
  const [email, setEmail] = useState("ainur@example.com");
  const [newEmail, setNewEmail] = useState("");

  const [cookiesAccepted, setCookiesAccepted] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(true);

  return (
    <div className="flex flex-col items-start justify-start w-full">
      <div className="w-full p-2 flex flex-col gap-2">
        <button
          type="button"
          className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
          onClick={() => setOverallOpen((prev) => !prev)}
        >
          <ChevronRight
            size={20}
            className={`${overallOpen ? "rotate-90" : "rotate-0"}`}
          />
          Overall
        </button>

        {overallOpen ? (
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

            <p className="text-(--gray-page)">
              News letter on updates and developments
            </p>
            <div className="w-full rounded-md border px-2 py-1 border-(--gray) wrap-break-word">
              {newsletterEnabled ? "Enabled" : "Disabled"}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={`w-max rounded-md border px-2 py-1 ${
                  newsletterEnabled
                    ? "border-(--accepted-border) bg-(--accepted-bg)/10 hover:bg-(--accepted-bg)/20"
                    : "border-(--gray) hover:bg-(--gray)/20"
                }`}
                onClick={() => setNewsletterEnabled(true)}
              >
                Enable
              </button>
              <button
                type="button"
                className={`w-max rounded-md border px-2 py-1 ${
                  !newsletterEnabled
                    ? "border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20"
                    : "border-(--gray) hover:bg-(--gray)/20"
                }`}
                onClick={() => setNewsletterEnabled(false)}
              >
                Disable
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="bg-(--gray)/10 w-full p-2 flex flex-col gap-2">
        <button
          type="button"
          className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
          onClick={() => setAccountOpen((prev) => !prev)}
        >
          <ChevronRight
            size={20}
            className={`${accountOpen ? "rotate-90" : "rotate-0"}`}
          />
          Account
        </button>

        {accountOpen ? (
          <div className="pl-7 flex flex-col gap-2 pb-2">
            <p className="text-(--gray-page)">Username</p>
            <div className="w-full rounded-md border px-2 py-1 border-(--gray) wrap-break-word">
              {username}
            </div>

            <p className="text-(--gray-page)">Change username</p>
            <input
              type="text"
              placeholder="Enter a new username..."
              className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const nextValue = newUsername.trim();
                  if (!nextValue) return;
                  setUsername(nextValue);
                  setNewUsername("");
                }
              }}
            />
            <button
              type="button"
              className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
              onClick={() => {
                const nextValue = newUsername.trim();
                if (!nextValue) return;
                setUsername(nextValue);
                setNewUsername("");
              }}
            >
              Save
            </button>

            <p className="text-(--gray-page)">Email</p>
            <div className="w-full rounded-md border px-2 py-1 border-(--gray) wrap-break-word">
              {email}
            </div>
          </div>
        ) : null}
      </div>

      <div className="w-full p-2 flex flex-col gap-2">
        <button
          type="button"
          className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
          onClick={() => setLegalOpen((prev) => !prev)}
        >
          <ChevronRight
            size={20}
            className={`${legalOpen ? "rotate-90" : "rotate-0"}`}
          />
          Legal
        </button>

        {legalOpen ? (
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
            >
              Delete account
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
