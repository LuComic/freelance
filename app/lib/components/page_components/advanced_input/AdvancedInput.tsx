"use client";

import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { useLiveComponentConfigActivator } from "@/app/lib/components/page_components/useLiveComponentConfigActivator";
import { AdvancedInputClient } from "./AdvancedInputClient";
import { AdvancedInputCreator } from "./AdvancedInputCreator";

export const AdvancedInput = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const liveConfigActivator = useLiveComponentConfigActivator(instanceId);
  const { component, liveState, updateConfig, updateLiveState } =
    usePageComponentState(instanceId, "AdvancedInput");

  return (
    <div
      className={`w-full flex flex-col gap-2 ${liveConfigActivator.className}`}
      onClickCapture={liveConfigActivator.onClickCapture}
    >
      {isLive ? (
        <AdvancedInputClient
          config={component.config}
          liveState={liveState.state}
          onChangeLiveState={updateLiveState}
        />
      ) : (
        <AdvancedInputCreator
          config={component.config}
          liveState={liveState.state}
          onChangeConfig={updateConfig}
          onChangeLiveState={updateLiveState}
        />
      )}
    </div>
  );
};
