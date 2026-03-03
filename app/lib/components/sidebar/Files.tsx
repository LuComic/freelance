"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FileItem } from "./FileItem";

type ExpansionState = {
  scopeProjectSlug: string | null;
  expandedProjectSlugs: string[];
};

export const Files = () => {
  const projects = useQuery(api.projects.queries.listCurrentUserProjects);
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const currentProjectSlug =
    segments[0] === "projects" ? (segments[1] ?? null) : null;
  const currentPageSlug =
    segments[2] && segments[2] !== "analytics" && segments[2] !== "settings"
      ? segments[2]
      : null;
  const currentProject =
    projects?.find((project) => project.slug === currentProjectSlug) ?? null;
  const projectTitle = currentProject?.name ?? "Projects";
  const [expansionState, setExpansionState] = useState<ExpansionState>({
    scopeProjectSlug: currentProjectSlug,
    expandedProjectSlugs: currentProjectSlug ? [currentProjectSlug] : [],
  });
  const scopedExpandedProjectSlugs =
    expansionState.scopeProjectSlug === currentProjectSlug
      ? expansionState.expandedProjectSlugs
      : currentProjectSlug
        ? [currentProjectSlug]
        : [];
  const expandedProjectSlugs = Array.from(
    new Set(
      currentPageSlug && currentProjectSlug
        ? [...scopedExpandedProjectSlugs, currentProjectSlug]
        : scopedExpandedProjectSlugs,
    ),
  );

  const toggleProjectExpanded = (projectSlug: string) => {
    setExpansionState((prev) => {
      const nextScopedExpandedProjectSlugs =
        prev.scopeProjectSlug === currentProjectSlug
          ? prev.expandedProjectSlugs
          : currentProjectSlug
            ? [currentProjectSlug]
            : [];

      return {
        scopeProjectSlug: currentProjectSlug,
        expandedProjectSlugs: nextScopedExpandedProjectSlugs.includes(
          projectSlug,
        )
          ? nextScopedExpandedProjectSlugs.filter(
              (slug) => slug !== projectSlug,
            )
          : [...nextScopedExpandedProjectSlugs, projectSlug],
      };
    });
  };

  return (
    <div className="flex flex-col gap-1 items-start justify-start w-full flex-1 min-h-0 overflow-y-auto">
      <p className="md:text-xl text-lg font-medium">
        {projectTitle.length > 30
          ? projectTitle.slice(0, 30) + "..."
          : projectTitle}
      </p>
      {projects === undefined ? (
        <p className="text-sm text-(--gray-page)">Loading projects...</p>
      ) : projects.length > 0 ? (
        projects.map((project) => (
          <FileItem
            key={project.id}
            project={project}
            currentPageSlug={currentPageSlug}
            isExpanded={expandedProjectSlugs.includes(project.slug)}
            onToggleExpanded={() => toggleProjectExpanded(project.slug)}
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
