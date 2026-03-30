"use client";

import { useCallback, type MouseEvent } from "react";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";

const INTERACTIVE_TARGET_SELECTOR =
  "button, a, input, textarea, select, option, [role='button']";

export function useLiveComponentConfigActivator(instanceId?: string) {
  const { isLive, modeLock, requestOpenComponentConfig } = useEditMode();
  const canOpenConfig =
    typeof instanceId === "string" && isLive && modeLock !== "live";

  const openConfig = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (!canOpenConfig || !instanceId) {
        return;
      }

      const interactiveTarget =
        event.target instanceof Element
          ? event.target.closest(INTERACTIVE_TARGET_SELECTOR)
          : null;

      if (
        interactiveTarget &&
        event.currentTarget instanceof Element &&
        event.currentTarget.contains(interactiveTarget)
      ) {
        return;
      }

      requestOpenComponentConfig(instanceId);
    },
    [canOpenConfig, instanceId, requestOpenComponentConfig],
  );

  return {
    canOpenConfig,
    className: canOpenConfig
      ? "border border-transparent rounded-sm hover:border-(--vibrant)"
      : "",
    onClickCapture: canOpenConfig ? openConfig : undefined,
  };
}
