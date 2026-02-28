"use client";

import { useSearchParams } from "next/navigation";
import { AccountSettingsSection } from "./AccountSettingsSection";
import { LegalSettingsSection } from "./LegalSettingsSection";
import { OverallSettingsSection } from "./OverallSettingsSection";
import { useAccountSettingsController } from "./useAccountSettingsController";

export function SettingsSections() {
  const searchParams = useSearchParams();
  const section = searchParams.get("section");
  const {
    isProfileLoading,
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
    handleNameSave,
    handleBioSave,
    deleteError,
    isDeleteConfirming,
    isDeletingAccount,
    handleDeleteAccount,
  } = useAccountSettingsController();

  return (
    <div className="flex flex-col items-start justify-start w-full">
      <OverallSettingsSection activeSection={section} />
      <AccountSettingsSection
        activeSection={section}
        isProfileLoading={isProfileLoading}
        currentName={currentName}
        currentBio={currentBio}
        currentEmail={currentEmail}
        nameDraft={nameDraft}
        setNameDraft={setNameDraft}
        bioDraft={bioDraft}
        setBioDraft={setBioDraft}
        saveError={saveError}
        isSavingName={isSavingName}
        isSavingBio={isSavingBio}
        canSaveName={canSaveName}
        canSaveBio={canSaveBio}
        onNameSave={handleNameSave}
        onBioSave={handleBioSave}
        deleteError={deleteError}
        isDeleteConfirming={isDeleteConfirming}
        isDeletingAccount={isDeletingAccount}
        onDeleteAccount={handleDeleteAccount}
      />
      <LegalSettingsSection activeSection={section} />
    </div>
  );
}
