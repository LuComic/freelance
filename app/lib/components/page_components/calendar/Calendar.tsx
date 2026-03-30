"use client";

import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { useLiveComponentConfigActivator } from "@/app/lib/components/page_components/useLiveComponentConfigActivator";
import { CalendarClient } from "./CalendarClient";
import { CalendarCreator } from "./CalendarCreator";

export const Calendar = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const liveConfigActivator = useLiveComponentConfigActivator(instanceId);
  const { liveState, commitLiveState } = usePageComponentState(
    instanceId,
    "Calendar",
  );

  return (
    <div
      className={`w-full flex flex-col gap-2 ${liveConfigActivator.className}`}
      onClickCapture={liveConfigActivator.onClickCapture}
    >
      {isLive ? (
        <CalendarClient liveState={liveState.state} />
      ) : (
        <CalendarCreator
          liveState={liveState.state}
          onCommitLiveState={commitLiveState}
        />
      )}
    </div>
  );
};
