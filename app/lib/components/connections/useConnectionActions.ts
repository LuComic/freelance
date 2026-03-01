"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useCallback, useState } from "react";
import type {
  ConnectionAction,
  PendingConnectionAction,
} from "./types";

export function useConnectionActions() {
  const sendFriendRequest = useMutation(api.connections.mutations.sendFriendRequest);
  const acceptFriendRequest = useMutation(
    api.connections.mutations.acceptFriendRequest,
  );
  const declineFriendRequest = useMutation(
    api.connections.mutations.declineFriendRequest,
  );
  const cancelFriendRequest = useMutation(
    api.connections.mutations.cancelFriendRequest,
  );
  const removeFriend = useMutation(api.connections.mutations.removeFriend);
  const blockUser = useMutation(api.connections.mutations.blockUser);
  const unblockUser = useMutation(api.connections.mutations.unblockUser);
  const [pendingAction, setPendingAction] =
    useState<PendingConnectionAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runConnectionAction = async (
    action: ConnectionAction,
    userId: Id<"users">,
  ) => {
    if (pendingAction !== null) {
      return false;
    }

    setPendingAction({ action, userId });
    setError(null);

    try {
      if (action === "sendFriendRequest") {
        await sendFriendRequest({ targetUserId: userId });
      } else if (action === "acceptFriendRequest") {
        await acceptFriendRequest({ targetUserId: userId });
      } else if (action === "declineFriendRequest") {
        await declineFriendRequest({ targetUserId: userId });
      } else if (action === "cancelFriendRequest") {
        await cancelFriendRequest({ targetUserId: userId });
      } else if (action === "removeFriend") {
        await removeFriend({ targetUserId: userId });
      } else if (action === "blockUser") {
        await blockUser({ targetUserId: userId });
      } else {
        await unblockUser({ targetUserId: userId });
      }

      return true;
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Could not update this connection.",
      );
      return false;
    } finally {
      setPendingAction(null);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    runConnectionAction,
    pendingAction,
    error,
    clearError,
  };
}
