"use client";

import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { useLiveComponentConfigActivator } from "@/app/lib/components/page_components/useLiveComponentConfigActivator";
import { TableClient } from "./TableClient";
import { TableCreator } from "./TableCreator";

export const Table = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const liveConfigActivator = useLiveComponentConfigActivator(instanceId);
  const { liveState, updateLiveState } = usePageComponentState(
    instanceId,
    "Table",
  );

  return (
    <div
      className={`w-full flex flex-col gap-2 ${liveConfigActivator.className}`}
      onClickCapture={liveConfigActivator.onClickCapture}
    >
      {isLive ? (
        <TableClient liveState={liveState.state} />
      ) : (
        <TableCreator
          liveState={liveState.state}
          onChangeLiveState={updateLiveState}
        />
      )}
    </div>
  );
};
