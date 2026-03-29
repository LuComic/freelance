"use client";

import { LoginPageButtons } from "@/app/lib/components/landing/login/LoginPageButtons";
import { api } from "@/convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import { Check, LoaderCircle, Minus, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: isAuthLoading } = useConvexAuth();
  const [agree, setAgree] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
  const [authDeniedMessage, setAuthDeniedMessage] = useState<string | null>(
    null,
  );
  const currentProfile = useQuery(api.users.queries.currentProfile);

  const trimmedEmail = emailDraft.trim();
  const hasValidEmailFormat =
    trimmedEmail.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const betaAccessResult = useQuery(
    api.betaAccess.queries.isEmailAllowedForSignup,
    hasValidEmailFormat ? { email: trimmedEmail } : "skip",
  );
  const betaEmailStatus =
    !trimmedEmail || !hasValidEmailFormat
      ? "idle"
      : betaAccessResult === undefined
        ? "checking"
        : betaAccessResult
          ? "allowed"
          : "denied";
  const canContinueWithGoogle = agree && betaEmailStatus === "allowed";
  const didReturnFromGoogle = searchParams.get("betaAuthAttempt") === "google";

  useEffect(() => {
    if (!didReturnFromGoogle || isAuthLoading || currentProfile === undefined) {
      return;
    }

    if (currentProfile && !currentProfile.isAnonymous) {
      router.replace("/projects");
      return;
    }

    void Promise.resolve().then(() => {
      setAuthDeniedMessage("This Google account is not approved for beta yet.");
    });
    router.replace("/login");
  }, [currentProfile, didReturnFromGoogle, isAuthLoading, router]);

  const emailIndicator =
    betaEmailStatus === "allowed" ? (
      <Check size={18} />
    ) : betaEmailStatus === "denied" ? (
      <X size={18} />
    ) : betaEmailStatus === "checking" ? (
      <LoaderCircle size={18} className="animate-spin" />
    ) : (
      <Minus size={18} />
    );
  const emailIndicatorClassName =
    betaEmailStatus === "allowed"
      ? "border-(--accepted-border) bg-(--accepted-bg)/10"
      : betaEmailStatus === "denied"
        ? "border-(--declined-border) bg-(--declined-border)/10"
        : "border-(--gray) bg-(--gray)/10";

  return (
    <div className="w-full mx-auto flex flex-col gap-2 md:max-w-2xl px-4 pt-20 pb-12 sm:px-6 lg:px-8">
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="md:text-3xl text-xl font-medium">Login or Sign up</p>
      </div>

      <p className="@[40rem]:text-xl text-lg font-medium">Login page</p>
      <p className="text-(--gray-page)">
        In here this component you can login with either Google or Apple
      </p>
      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        {authDeniedMessage ? (
          <p className="rounded-md border border-(--declined-border) bg-(--declined-border)/10 px-3 py-2">
            {authDeniedMessage}
          </p>
        ) : null}
        <p className="text-(--gray-page)">
          Check if your email is in the beta list
        </p>
        <div className="w-full flex items-center justify-between gap-2">
          <input
            type="email"
            value={emailDraft}
            placeholder="Enter your email..."
            className="rounded-md bg-(--dim) px-2 py-1.5 outline-none w-full"
            onChange={(event) => {
              setAuthDeniedMessage(null);
              setEmailDraft(event.target.value);
            }}
          />
          <span
            className={`h-8.5 aspect-square flex items-center justify-center rounded-md border ${emailIndicatorClassName}`}
          >
            {emailIndicator}
          </span>
        </div>
        <button
          type="button"
          className={`flex w-full items-start gap-2 border px-2 py-1.5 text-left @[40rem]:w-1/2 ${
            agree
              ? "border-(--vibrant) bg-(--vibrant)/10"
              : "border-(--gray) bg-(--gray)/10"
          } rounded-sm`}
          onClick={() => setAgree((prev) => !prev)}
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-(--darkest) p-1">
            {agree && (
              <span className="bg-(--vibrant) aspect-square h-full rounded-xs" />
            )}
          </span>
          <span className="text-wrap">
            Agree with our{" "}
            <Link
              href="/legal/cookies"
              onClick={(event) => event.stopPropagation()}
              className="text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover)"
              target="_blank"
            >
              Cookies,
            </Link>{" "}
            our{" "}
            <Link
              href="/legal/privacy"
              onClick={(event) => event.stopPropagation()}
              className="text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover)"
              target="_blank"
            >
              Privacy
            </Link>{" "}
            and our{" "}
            <Link
              href="/legal/terms"
              onClick={(event) => event.stopPropagation()}
              className="text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover)"
              target="_blank"
            >
              Terms of Service
            </Link>
          </span>
        </button>
        <LoginPageButtons
          type={"google"}
          disabled={!canContinueWithGoogle}
          redirectTo="/login?betaAuthAttempt=google"
        />
        {/* <LoginPageButtons type={"apple"} /> */}
      </div>
    </div>
  );
}
