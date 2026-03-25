"use client";

import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { IdeaFormClient } from "./IdeaFormClient";
import { IdeaFormCreator } from "./IdeaFormCreator";

export const IdeaForm = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const { liveState, updateLiveState } = usePageComponentState(
    instanceId,
    "IdeaForm",
  );

  return (
    <div
      className={`w-full flex flex-col gap-2 ${!isLive ? "bg-(--gray)/10" : null}`}
    >
      {isLive ? (
        <IdeaFormClient liveState={liveState.state} />
      ) : (
        <IdeaFormCreator
          liveState={liveState.state}
          onChangeLiveState={updateLiveState}
        />
      )}
    </div>
  );
};
