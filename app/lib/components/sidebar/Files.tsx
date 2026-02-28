"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import { FileItem } from "./FileItem";

export const Files = () => {
  const projects = useQuery(api.projects.queries.listCurrentUserProjects);
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const currentProjectSlug = segments[0] === "projects" ? segments[1] : null;
  const currentPageSlug =
    segments[2] && segments[2] !== "analytics" && segments[2] !== "settings"
      ? segments[2]
      : null;
  const currentProject =
    projects?.find((project) => project.slug === currentProjectSlug) ?? null;
  const projectTitle = currentProject?.name ?? "Projects";

  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full flex-1 min-h-0 overflow-y-auto">
      <p className="md:text-xl text-lg font-medium">{projectTitle}</p>
      {projects === undefined ? (
        <p className="text-sm text-(--gray-page)">Loading projects...</p>
      ) : projects.length > 0 ? (
        projects.map((project) => (
          <FileItem
            key={project.id}
            project={project}
            currentProjectSlug={currentProjectSlug}
            currentPageSlug={currentPageSlug}
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
