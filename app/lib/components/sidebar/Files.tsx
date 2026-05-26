"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FileItem } from "./FileItem";

type FilesProps = {
  closeSidebar?: () => void;
};

type ActiveProjectRoute = {
  projectId: string;
  pageId: string | null;
  autoExpansionKey: string | null;
};

const AUTO_EXPANDED_PROJECT_ROUTES = new Set(["analytics", "settings"]);

function getActiveProjectRoute(pathname: string): ActiveProjectRoute | null {
  const [rootSegment, projectId, routeSegment] = pathname
    .split("/")
    .filter(Boolean);

  if (rootSegment !== "projects" || !projectId) {
    return null;
  }

  if (!routeSegment) {
    return {
      projectId,
      pageId: null,
      autoExpansionKey: null,
    };
  }

  const isProjectUtilityPage = AUTO_EXPANDED_PROJECT_ROUTES.has(routeSegment);

  return {
    projectId,
    pageId: isProjectUtilityPage ? null : routeSegment,
    autoExpansionKey: `${projectId}/${routeSegment}`,
  };
}

export const Files = ({ closeSidebar }: FilesProps) => {
  const projects = useQuery(api.projects.queries.listCurrentUserProjects);
  const activeProjectRoute = getActiveProjectRoute(usePathname());
  const currentProject =
    projects?.find((project) => project.id === activeProjectRoute?.projectId) ??
    null;
  const projectTitle = currentProject?.name ?? "Projects";
  const [expandedProjectIds, setExpandedProjectIds] = useState<string[]>([]);
  const [collapsedAutoExpansionKey, setCollapsedAutoExpansionKey] = useState<
    string | null
  >(null);

  const isProjectExpanded = (projectId: string) =>
    expandedProjectIds.includes(projectId) ||
    (projectId === activeProjectRoute?.projectId &&
      activeProjectRoute.autoExpansionKey !== null &&
      activeProjectRoute.autoExpansionKey !== collapsedAutoExpansionKey);

  const rememberProjectRouteAccess = (projectId: string) => {
    setExpandedProjectIds((prev) => {
      if (prev.includes(projectId)) {
        return prev;
      }

      return [...prev, projectId];
    });
  };

  const toggleProjectExpanded = (projectId: string) => {
    const isExpanded = isProjectExpanded(projectId);

    if (projectId === activeProjectRoute?.projectId) {
      setCollapsedAutoExpansionKey(
        isExpanded ? activeProjectRoute.autoExpansionKey : null,
      );
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
            currentPageId={activeProjectRoute?.pageId}
            isExpanded={isProjectExpanded(project.id)}
            onToggleExpanded={() => toggleProjectExpanded(project.id)}
            onProjectRouteAccess={() => rememberProjectRouteAccess(project.id)}
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
