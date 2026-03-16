"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import {
  usePageComponentState,
  usePageDocument,
} from "@/app/lib/components/project/PageDocumentContext";
import { PageLinkClient } from "./PageLinkClient";
import { PageLinkCreator } from "./PageLinkCreator";

export type ProjectPageOption = {
  id: string;
  slug: string;
  title: string;
};

export const PageLink = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const { activePage } = usePageDocument();
  const { component, updateConfig } = usePageComponentState(
    instanceId,
    "PageLink",
  );
  const projectData = useQuery(api.projects.queries.getProjectRootBySlug, {
    projectSlug: activePage.project.slug,
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
    <div className="w-full flex flex-col gap-2">
      {isLive ? (
        <PageLinkClient
          config={component.config}
          projectSlug={activePage.project.slug}
          targetPage={targetPage}
        />
      ) : (
        <PageLinkCreator
          config={component.config}
          pages={selectablePages}
          isLoadingPages={projectData === undefined}
          onChangeConfig={updateConfig}
        />
      )}
    </div>
  );
};
