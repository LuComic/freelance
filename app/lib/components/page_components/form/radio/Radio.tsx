"use client";

import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { useLiveComponentConfigActivator } from "@/app/lib/components/page_components/useLiveComponentConfigActivator";
import { RadioCreator } from "./RadioCreator";
import { RadioClient } from "./RadioClient";

export const Radio = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const liveConfigActivator = useLiveComponentConfigActivator(instanceId);
  const { component, liveState, updateConfig, updateLiveState } =
    usePageComponentState(instanceId, "Radio");

  return (
    <div
      className={`w-full flex flex-col gap-2 ${liveConfigActivator.className}`}
      onClickCapture={liveConfigActivator.onClickCapture}
    >
      {isLive ? (
        <RadioClient
          config={component.config}
          liveState={liveState.state}
          onChangeLiveState={updateLiveState}
        />
      ) : (
        <RadioCreator
          config={component.config}
          liveState={liveState.state}
          onChangeConfig={updateConfig}
          onChangeLiveState={updateLiveState}
        />
      )}
    </div>
  );
};
