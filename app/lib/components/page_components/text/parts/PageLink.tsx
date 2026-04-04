"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import {
  usePageComponentState,
  usePageDocument,
} from "@/app/lib/components/project/PageDocumentContext";
import { useLiveComponentConfigActivator } from "@/app/lib/components/page_components/useLiveComponentConfigActivator";
import { PageLinkClient } from "./PageLinkClient";
import { PageLinkCreator } from "./PageLinkCreator";
import type { ProjectPageOption } from "./PageLink.shared";

export const PageLink = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const liveConfigActivator = useLiveComponentConfigActivator(instanceId);
  const { activePage } = usePageDocument();
  const { component, updateConfig } = usePageComponentState(
    instanceId,
    "PageLink",
  );
  const projectData = useQuery(api.projects.queries.getProjectRoot, {
    projectId: activePage.project.id as never,
  });

  const selectablePages: ProjectPageOption[] =
    projectData?.pages.filter((page) => page.id !== activePage.page.id) ?? [];
  const targetPage =
    projectData?.pages.find(
      (page) =>
        page.id === component.config.targetPageId &&
        page.id !== activePage.page.id,
    ) ?? null;

  return (
    <div
      className={`w-full flex flex-col gap-2 ${liveConfigActivator.className}`}
      onClickCapture={liveConfigActivator.onClickCapture}
    >
      {isLive ? (
        <PageLinkClient
          config={component.config}
          projectId={activePage.project.id}
          targetPage={targetPage}
        />
      ) : (
        <PageLinkCreator
          config={component.config}
          instanceId={instanceId}
          pages={selectablePages}
          isLoadingPages={projectData === undefined}
          onChangeConfig={updateConfig}
        />
      )}
    </div>
  );
};
