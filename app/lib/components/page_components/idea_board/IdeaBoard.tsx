"use client";

import { api } from "@/convex/_generated/api";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import {
  usePageComponentState,
  usePageDocument,
} from "@/app/lib/components/project/PageDocumentContext";
import { useQuery } from "convex/react";
import { useMemo } from "react";
import { IdeaBoardClient } from "./IdeaBoardClient";
import { IdeaBoradCreator } from "./IdeaBoradCreator";

export const IdeaBoard = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const { activePage } = usePageDocument();
  const projectMembers = useQuery(api.projects.members.getProjectMembers, {
    projectId: activePage.project.id as never,
  });
  const { liveState, updateLiveState, component, updateConfig } =
    usePageComponentState(instanceId, "IdeaBoard");
  const currentUserId = useQuery(api.users.queries.currentProfile)?.id ?? null;
  const authorNames = useMemo(
    () =>
      Object.fromEntries(
        (projectMembers?.members ?? []).map((member) => [
          String(member.userId),
          member.name,
        ]),
      ),
    [projectMembers],
  );

  return (
    <div className="w-full flex flex-col gap-2">
      {isLive ? (
        <IdeaBoardClient
          authorNames={authorNames}
          config={component.config}
          currentUserId={currentUserId}
          liveState={liveState.state}
          onChangeLiveState={updateLiveState}
        />
      ) : (
        <IdeaBoradCreator
          authorNames={authorNames}
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
