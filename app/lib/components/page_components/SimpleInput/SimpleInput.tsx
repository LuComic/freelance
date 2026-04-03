"use client";

import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { useLiveComponentConfigActivator } from "@/app/lib/components/page_components/useLiveComponentConfigActivator";
import { SimpleInputClient } from "./SimpleInputClient";
import { SimpleInputCreator } from "./SimpleInputCreator";

export const SimpleInput = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const liveConfigActivator = useLiveComponentConfigActivator(instanceId);
  const { liveState, updateLiveState } = usePageComponentState(
    instanceId,
    "SimpleInput",
  );

  return (
    <div
      className={`w-full flex flex-col gap-2 ${liveConfigActivator.className}`}
      onClickCapture={liveConfigActivator.onClickCapture}
    >
      {isLive ? (
        <SimpleInputClient
          liveState={liveState.state}
          onChangeLiveState={updateLiveState}
        />
      ) : (
        <SimpleInputCreator
          liveState={liveState.state}
          onChangeLiveState={updateLiveState}
        />
      )}
    </div>
  );
};
