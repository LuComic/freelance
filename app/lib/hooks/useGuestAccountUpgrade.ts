"use client";

import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { useCallback, useState } from "react";
import { storeGuestUpgradeToken } from "../guestUpgrade";

function getPreferredPath() {
  if (typeof window === "undefined") {
    return "/projects";
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function useGuestAccountUpgrade() {
  const { signIn } = useAuthActions();
  const prepareGuestUpgrade = useMutation(
    api.projects.join.prepareGuestUpgrade,
  );
  const [isStartingUpgrade, setIsStartingUpgrade] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  const startGuestUpgrade = useCallback(async () => {
    if (isStartingUpgrade) {
      return;
    }

    setIsStartingUpgrade(true);
    setUpgradeError(null);

    try {
      const result = await prepareGuestUpgrade({
        preferredPath: getPreferredPath(),
      });
      storeGuestUpgradeToken(result.token);
      await signIn("google", {
        redirectTo: "/projects?betaUpgradeAttempt=google",
      });
    } catch (error) {
      setUpgradeError(
        error instanceof Error
          ? error.message
          : "Could not start the account upgrade flow.",
      );
      setIsStartingUpgrade(false);
    }
  }, [isStartingUpgrade, prepareGuestUpgrade, signIn]);

  return {
    startGuestUpgrade,
    isStartingUpgrade,
    upgradeError,
    clearUpgradeError: useCallback(() => setUpgradeError(null), []),
  };
}
