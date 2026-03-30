"use client";

import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { useLiveComponentConfigActivator } from "@/app/lib/components/page_components/useLiveComponentConfigActivator";
import { KanbanCreator } from "./KanbanCreator";
import { KanbanClient } from "./KanbanClient";

export const Kanban = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const liveConfigActivator = useLiveComponentConfigActivator(instanceId);
  const { component, liveState, updateConfig, updateLiveState } =
    usePageComponentState(instanceId, "Kanban");

  return (
    <div
      className={`w-full flex flex-col rounded-sm gap-2 ${liveConfigActivator.className}`}
      onClickCapture={liveConfigActivator.onClickCapture}
    >
      {isLive ? (
        <KanbanClient liveState={liveState.state} />
      ) : (
        <KanbanCreator
          config={component.config}
          liveState={liveState.state}
          onChangeConfig={updateConfig}
          onChangeLiveState={updateLiveState}
        />
      )}
    </div>
  );
};
