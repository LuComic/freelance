"use client";

import { LoginPageButtons } from "@/app/lib/components/landing/login/LoginPageButtons";
import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";

export default function Page() {
  const [agree, setAgree] = useState(false);
  const [validEmail, setVaidEmail] = useState(false);

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
        <p className="text-(--gray-page)">
          Check if your email is in the beta list
        </p>
        <div className="w-full flex items-center justify-between gap-2">
          <input
            type="email"
            placeholder="Enter your email..."
            className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none w-full"
          />
          <span
            className={`h-8.5 aspect-square flex items-center justify-center rounded-md border ${validEmail ? "border-(--accepted-border) bg-(--accepted-bg)/10" : "border-(--gray) bg-(--gray)/10"}`}
          >
            {validEmail ? <Check size={18} /> : <X size={18} />}
          </span>
        </div>
        <button
          type="button"
          className={`flex items-center gap-2 justify-start w-full @[40rem]:w-1/2 border px-2 py-1.5 ${
            agree
              ? "border-(--vibrant) bg-(--vibrant)/10"
              : "border-(--gray) bg-(--gray)/10"
          } rounded-sm`}
          onClick={() => setAgree((prev) => !prev)}
        >
          <span className="h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-sm bg-(--darkest)">
            {agree && (
              <span className="bg-(--vibrant) aspect-square h-full rounded-xs" />
            )}
          </span>
          Agree with our
          <Link
            href="/legal/cookies"
            onClick={(event) => event.stopPropagation()}
            className="text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover)"
            target="_blank"
          >
            Cookies,
          </Link>
          our
          <Link
            href="/legal/privacy"
            onClick={(event) => event.stopPropagation()}
            className="text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover)"
            target="_blank"
          >
            Privacy
          </Link>
          and our
          <Link
            href="/legal/terms"
            onClick={(event) => event.stopPropagation()}
            className="text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover)"
            target="_blank"
          >
            Terms of Service
          </Link>
        </button>
        <LoginPageButtons type={"google"} disabled={!agree} />
        {/* <LoginPageButtons type={"apple"} /> */}
      </div>
    </div>
  );
}
