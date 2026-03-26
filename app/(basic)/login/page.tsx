"use client";

import { LegalToggles } from "@/app/lib/components/landing/login/LegalToggles";
import { DEFAULT_LEGAL_ACCEPTANCE_STATE } from "@/app/lib/components/landing/login/LegalToggles";
import { LoginPageButtons } from "@/app/lib/components/landing/login/LoginPageButtons";
import { useState } from "react";

export default function Page() {
  const [acceptedDocuments, setAcceptedDocuments] = useState(
    DEFAULT_LEGAL_ACCEPTANCE_STATE,
  );
  const canContinue =
    acceptedDocuments.cookies &&
    acceptedDocuments.privacy &&
    acceptedDocuments.tos;

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
        <LegalToggles
          value={acceptedDocuments}
          onChange={setAcceptedDocuments}
        />
        <LoginPageButtons type={"google"} disabled={!canContinue} />
        {/* <LoginPageButtons type={"apple"} /> */}
      </div>
    </div>
  );
}
