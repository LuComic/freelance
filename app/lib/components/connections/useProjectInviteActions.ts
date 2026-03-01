"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useCallback, useState } from "react";

type ProjectInviteAction = "accept" | "decline";

type PendingProjectInviteAction = {
  action: ProjectInviteAction;
  inviteId: Id<"projectInvites">;
};

export function useProjectInviteActions() {
  const acceptProjectInvite = useMutation(api.projects.invites.acceptProjectInvite);
  const declineProjectInvite = useMutation(
    api.projects.invites.declineProjectInvite,
  );
  const [pendingAction, setPendingAction] =
    useState<PendingProjectInviteAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runProjectInviteAction = useCallback(
    async (action: ProjectInviteAction, inviteId: Id<"projectInvites">) => {
      if (pendingAction !== null) {
        return false;
      }

      setPendingAction({ action, inviteId });
      setError(null);

      try {
        if (action === "accept") {
          await acceptProjectInvite({ inviteId });
        } else {
          await declineProjectInvite({ inviteId });
        }

        return true;
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Could not update this project invite.",
        );
        return false;
      } finally {
        setPendingAction(null);
      }
    },
    [acceptProjectInvite, declineProjectInvite, pendingAction],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    runProjectInviteAction,
    pendingAction,
    error,
    clearError,
  };
}
