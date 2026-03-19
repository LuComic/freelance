"use client";

import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { IdeaBoardClient } from "./IdeaBoardClient";
import { IdeaBoradCreator } from "./IdeaBoradCreator";

export const IdeaBoard = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const { liveState, updateLiveState } = usePageComponentState(
    instanceId,
    "IdeaBoard",
  );

  return (
    <div className="w-full flex flex-col gap-2">
      {isLive ? (
        <IdeaBoardClient liveState={liveState.state} />
      ) : (
        <IdeaBoradCreator
          liveState={liveState.state}
          onChangeLiveState={updateLiveState}
        />
      )}
    </div>
  );
};
