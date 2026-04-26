"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FileItem } from "./FileItem";

type FilesProps = {
  closeSidebar?: () => void;
};

export const Files = ({ closeSidebar }: FilesProps) => {
  const projects = useQuery(api.projects.queries.listCurrentUserProjects);
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const currentProjectId =
    segments[0] === "projects" ? (segments[1] ?? null) : null;
  const currentPageId =
    segments[2] && segments[2] !== "analytics" && segments[2] !== "settings"
      ? segments[2]
      : null;
  const currentProject =
    projects?.find((project) => project.id === currentProjectId) ?? null;
  const projectTitle = currentProject?.name ?? "Projects";
  const [expandedProjectIds, setExpandedProjectIds] = useState<string[]>([]);
  const [collapsedAutoExpansionKey, setCollapsedAutoExpansionKey] = useState<
    string | null
  >(null);
  const autoExpandedProjectId =
    currentProjectId && currentPageId ? currentProjectId : null;
  const autoExpansionKey =
    currentProjectId && currentPageId
      ? `${currentProjectId}/${currentPageId}`
      : null;
  const effectiveExpandedProjectIds =
    autoExpandedProjectId &&
    autoExpansionKey !== collapsedAutoExpansionKey &&
    !expandedProjectIds.includes(autoExpandedProjectId)
      ? [...expandedProjectIds, autoExpandedProjectId]
      : expandedProjectIds;

  const toggleProjectExpanded = (projectId: string) => {
    const isExpanded = effectiveExpandedProjectIds.includes(projectId);

    if (projectId === autoExpandedProjectId) {
      setCollapsedAutoExpansionKey(isExpanded ? autoExpansionKey : null);
    }

    setExpandedProjectIds((prev) =>
      isExpanded
        ? prev.filter((expandedId) => expandedId !== projectId)
        : [...prev, projectId],
    );
  };

  return (
    <div className="flex flex-col gap-1 items-start justify-start w-full flex-1 min-h-0 overflow-y-auto overscroll-contain">
      <p className="md:text-xl text-lg font-medium">
        {projectTitle.length > 30
          ? projectTitle.slice(0, 30) + "..."
          : projectTitle}
      </p>
      {projects === undefined ? (
        <>
          <div className="bg-(--gray)/60 w-full mt-2 h-5.5 rounded-md animate-pulse"></div>
          <div className="bg-(--gray)/60 w-2/3 mt-2 h-5.5 rounded-md animate-pulse"></div>
        </>
      ) : projects.length > 0 ? (
        projects.map((project) => (
          <FileItem
            key={project.id}
            project={project}
            currentPageId={currentPageId}
            isExpanded={effectiveExpandedProjectIds.includes(project.id)}
            onToggleExpanded={() => toggleProjectExpanded(project.id)}
            closeSidebar={closeSidebar}
          />
        ))
      ) : (
        <p className="text-sm text-(--gray-page)">
          Create a project to see it appear here.
        </p>
      )}
    </div>
  );
};
