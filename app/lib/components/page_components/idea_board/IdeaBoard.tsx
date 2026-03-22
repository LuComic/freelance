"use client";

import { api } from "@/convex/_generated/api";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import {
  usePageComponentState,
  usePageDocument,
} from "@/app/lib/components/project/PageDocumentContext";
import { useQuery } from "convex/react";
import { IdeaBoardClient } from "./IdeaBoardClient";
import { IdeaBoradCreator } from "./IdeaBoradCreator";

export const IdeaBoard = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const { activePage } = usePageDocument();
  const currentProfile = useQuery(api.users.queries.currentProfile);
  const projectMembers = useQuery(api.projects.members.getProjectMembers, {
    projectId: activePage.project.id as never,
  });
  const { liveState, updateLiveState, component, updateConfig } =
    usePageComponentState(instanceId, "IdeaBoard");
  const currentUserId = currentProfile?.id ?? null;
  const clientUserIds =
    projectMembers?.clients.map((member) => member.userId) ?? [];

  return (
    <div className="w-full flex flex-col gap-2">
      {isLive ? (
        <IdeaBoardClient
          config={component.config}
          currentUserId={currentUserId}
          liveState={liveState.state}
          onChangeLiveState={updateLiveState}
        />
      ) : (
        <IdeaBoradCreator
          clientUserIds={clientUserIds}
          config={component.config}
          currentUserId={currentUserId}
          liveState={liveState.state}
          onChangeConfig={updateConfig}
          onChangeLiveState={updateLiveState}
        />
      )}
    </div>
  );
};
