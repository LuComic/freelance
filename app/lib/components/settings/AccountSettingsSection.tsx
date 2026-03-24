"use client";

import { useGuestAccountUpgrade } from "@/app/lib/hooks/useGuestAccountUpgrade";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type AccountSettingsSectionProps = {
  activeSection: string | null;
  isProfileLoading: boolean;
  isAnonymous: boolean;
  currentName: string;
  currentBio: string;
  currentEmail: string;
  nameDraft: string;
  setNameDraft: (value: string) => void;
  bioDraft: string;
  setBioDraft: (value: string) => void;
  saveError: string | null;
  isSavingName: boolean;
  isSavingBio: boolean;
  canSaveName: boolean;
  canSaveBio: boolean;
  onNameSave: () => Promise<void>;
  onBioSave: () => Promise<void>;
  deleteError: string | null;
  isDeleteConfirming: boolean;
  isDeletingAccount: boolean;
  onDeleteAccount: () => Promise<void>;
};

export function AccountSettingsSection({
  activeSection,
  isProfileLoading,
  isAnonymous,
  currentName,
  currentBio,
  currentEmail,
  nameDraft,
  setNameDraft,
  bioDraft,
  setBioDraft,
  saveError,
  isSavingName,
  isSavingBio,
  canSaveName,
  canSaveBio,
  onNameSave,
  onBioSave,
  deleteError,
  isDeleteConfirming,
  isDeletingAccount,
  onDeleteAccount,
}: AccountSettingsSectionProps) {
  const { startGuestUpgrade, isStartingUpgrade, upgradeError } =
    useGuestAccountUpgrade();
  const [open, setOpen] = useState(activeSection === "account");

  useEffect(() => {
    queueMicrotask(() => {
      setOpen(activeSection === "account");
    });
  }, [activeSection]);

  return (
    <div className="bg-(--gray)/10 w-full p-2 flex flex-col gap-2">
      <button
        type="button"
        className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
        onClick={() => setOpen((prev) => !prev)}
      >
        <ChevronRight
          size={20}
          className={`${open ? "rotate-90" : "rotate-0"}`}
        />
        Account
      </button>

      {open ? (
        <div className="pl-7 flex flex-col gap-2 pb-2">
          {isAnonymous ? (
            <>
              <p className="text-(--gray-page)">
                This guest account is only tied to the current client project.
              </p>
              <button
                type="button"
                className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) disabled:opacity-60"
                onClick={() => void startGuestUpgrade()}
                disabled={isStartingUpgrade}
              >
                {isStartingUpgrade
                  ? "Creating account..."
                  : "Create an account"}
              </button>
              {upgradeError ? (
                <p className="text-sm text-(--declined-border)">
                  {upgradeError}
                </p>
              ) : null}
            </>
          ) : null}
          {!isAnonymous ? (
            <>
              <p className="text-(--gray-page)">Username</p>
              <div className="w-full rounded-md border px-2 py-1 border-(--gray) wrap-break-word">
                {isProfileLoading ? "Loading..." : currentName || "Not set"}
              </div>

              <p className="text-(--gray-page)">Change username</p>
              <input
                type="text"
                placeholder="Enter a new username..."
                className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                disabled={isProfileLoading || isSavingName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void onNameSave();
                  }
                }}
              />
              <button
                type="button"
                className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-(--vibrant)"
                onClick={() => void onNameSave()}
                disabled={!canSaveName}
              >
                {isSavingName ? "Saving..." : "Save"}
              </button>

              <p className="text-(--gray-page)">Bio/Description</p>
              <div className="w-full rounded-md border px-2 py-1 border-(--gray) wrap-break-word">
                {isProfileLoading ? "Loading..." : currentBio || "Not set"}
              </div>

              <p className="text-(--gray-page)">Change bio</p>
              <input
                type="text"
                placeholder="Enter a new bio..."
                className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                disabled={isProfileLoading || isSavingBio}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void onBioSave();
                  }
                }}
              />
              <button
                type="button"
                className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-(--vibrant)"
                onClick={() => void onBioSave()}
                disabled={!canSaveBio}
              >
                {isSavingBio ? "Saving..." : "Save"}
              </button>

              <p className="text-(--gray-page)">Email</p>
              <div className="w-full rounded-md border px-2 py-1 border-(--gray) wrap-break-word">
                {isProfileLoading ? "Loading..." : currentEmail || "Not set"}
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
                <p className="text-sm text-(--declined-border)">
                  {deleteError}
                </p>
              ) : null}
              {saveError ? (
                <p className="text-sm text-(--declined-border)">{saveError}</p>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
