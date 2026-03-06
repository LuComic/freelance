"use client";

import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useAccountSettingsController() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const profile = useQuery(api.users.queries.currentProfile);
  const updateProfile = useMutation(api.users.mutations.updateProfile);
  const deleteAccount = useMutation(api.users.mutations.deleteAccount);
  const [nameDraft, setNameDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const isProfileReady = profile !== undefined && profile !== null;
  const isProfileLoading = profile === undefined;
  const isAnonymous = profile?.isAnonymous === true;
  const currentName = profile?.name ?? "";
  const currentBio = profile?.bio ?? "";
  const currentEmail = profile?.email ?? "";

  useEffect(() => {
    if (!isProfileReady) {
      return;
    }

    queueMicrotask(() => {
      setNameDraft(currentName);
      setBioDraft(currentBio);
    });
  }, [currentBio, currentName, isProfileReady]);

  const canSaveName =
    !isProfileLoading &&
    !isAnonymous &&
    !isSavingName &&
    nameDraft.trim().length > 0 &&
    nameDraft.trim() !== currentName;

  const canSaveBio =
    !isProfileLoading &&
    !isAnonymous &&
    !isSavingBio &&
    bioDraft.trim() !== currentBio;

  const handleNameSave = async () => {
    if (!canSaveName) {
      return;
    }

    setIsSavingName(true);
    setSaveError(null);

    try {
      await updateProfile({ name: nameDraft });
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not update username.",
      );
    } finally {
      setIsSavingName(false);
    }
  };

  const handleBioSave = async () => {
    if (!canSaveBio) {
      return;
    }

    setIsSavingBio(true);
    setSaveError(null);

    try {
      await updateProfile({ bio: bioDraft });
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not update bio.",
      );
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (isDeletingAccount) {
      return;
    }

    if (!isDeleteConfirming) {
      setDeleteError(null);
      setIsDeleteConfirming(true);
      return;
    }

    setDeleteError(null);
    setIsDeletingAccount(true);

    try {
      await deleteAccount({});
      await signOut();
      router.replace("/");
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Could not delete account.",
      );
      setIsDeleteConfirming(false);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return {
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
    handleNameSave,
    handleBioSave,
    deleteError,
    isDeleteConfirming,
    isDeletingAccount,
    handleDeleteAccount,
  };
}
