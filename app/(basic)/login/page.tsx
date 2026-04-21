"use client";

import { LoginPageButtons } from "@/app/lib/components/landing/login/LoginPageButtons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function AuthDeniedMessage() {
  const searchParams = useSearchParams();
  const didReturnFromGoogle = searchParams.get("betaAuthAttempt") === "google";

  useEffect(() => {
    if (!didReturnFromGoogle) {
      return;
    }

    window.history.replaceState(null, "", "/login");
  }, [didReturnFromGoogle]);

  if (!didReturnFromGoogle) {
    return null;
  }

  return (
    <p className="rounded-md border border-(--declined-border) bg-(--declined-border)/10 px-3 py-2">
      This Google account is not approved for beta yet.
    </p>
  );
}

export default function Page() {
  const [agree, setAgree] = useState(false);

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
        <Suspense fallback={null}>
          <AuthDeniedMessage />
        </Suspense>
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
          disabled={!agree}
          redirectTo="/login?betaAuthAttempt=google"
        />
        {/* <LoginPageButtons type={"apple"} /> */}
      </div>
    </div>
  );
}
