"use client";

import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { FeedbackCreator } from "./FeedbackCreator";
import { FeedbackClient } from "./FeedbackClient";

export const Feedback = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const {
    component,
    liveState,
    updateConfig,
    updateLiveState,
    commitLiveState,
  } = usePageComponentState(instanceId, "Feedback");

  return (
    <div className="w-full flex flex-col gap-2">
      {isLive ? (
        <FeedbackClient
          config={component.config}
          liveState={liveState.state}
          onChangeLiveState={updateLiveState}
        />
      ) : (
        <FeedbackCreator
          config={component.config}
          liveState={liveState.state}
          onChangeConfig={updateConfig}
          onChangeLiveState={updateLiveState}
          onCommitLiveState={commitLiveState}
        />
      )}
    </div>
  );
};
