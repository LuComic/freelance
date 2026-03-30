"use client";

import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { useLiveComponentConfigActivator } from "@/app/lib/components/page_components/useLiveComponentConfigActivator";
import { SelectCreator } from "./SelectCreator";
import { SelectClient } from "./SelectClient";

export const Select = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const liveConfigActivator = useLiveComponentConfigActivator(instanceId);
  const { component, liveState, updateConfig, updateLiveState } =
    usePageComponentState(instanceId, "Select");

  return (
    <div
      className={`w-full flex flex-col rounded-sm gap-2 ${liveConfigActivator.className}`}
      onClickCapture={liveConfigActivator.onClickCapture}
    >
      {isLive ? (
        <SelectClient
          config={component.config}
          liveState={liveState.state}
          onChangeLiveState={updateLiveState}
        />
      ) : (
        <SelectCreator
          config={component.config}
          onChangeConfig={updateConfig}
          onChangeLiveState={updateLiveState}
        />
      )}
    </div>
  );
};
