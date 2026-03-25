"use client";

import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { SelectCreator } from "./SelectCreator";
import { SelectClient } from "./SelectClient";

export const Select = ({
  instanceId,
}: {
  instanceId: string;
}) => {
  const { isLive } = useEditMode();
  const { component, liveState, updateConfig, updateLiveState } =
    usePageComponentState(instanceId, "Select");

  return (
    <div
      className={`w-full flex flex-col gap-2 ${!isLive ? "bg-(--gray)/10" : null}`}
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
