"use client";

import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { KanbanCreator } from "./KanbanCreator";
import { KanbanClient } from "./KanbanClient";

export const Kanban = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const { component, liveState, updateConfig, updateLiveState } =
    usePageComponentState(instanceId, "Kanban");

  return (
    <div
      className={`w-full flex flex-col gap-2 ${!isLive ? "bg-(--gray)/10" : null}`}
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
