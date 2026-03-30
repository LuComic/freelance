"use client";

import { useCallback } from "react";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";

export function useLiveComponentConfigActivator(instanceId?: string) {
  const { isLive, modeLock, requestOpenComponentConfig } = useEditMode();
  const canOpenConfig =
    typeof instanceId === "string" && isLive && modeLock !== "live";

  const openConfig = useCallback(() => {
    if (!canOpenConfig || !instanceId) {
      return;
    }

    requestOpenComponentConfig(instanceId);
  }, [canOpenConfig, instanceId, requestOpenComponentConfig]);

  return {
    canOpenConfig,
    className: canOpenConfig
      ? "border border-transparent rounded-sm hover:border-(--vibrant)"
      : "",
    onClickCapture: canOpenConfig ? openConfig : undefined,
  };
}
