"use client";

import { usePathname } from "next/navigation";
import { FileItem } from "./FileItem";
import { formatSlugLabel } from "../project/projectSlug";

export const Files = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const isProjectsRoot = pathname === "/projects";
  const projectSlug = segments[1];
  const currentPageSlug =
    segments[2] && segments[2] !== "analytics" && segments[2] !== "settings"
      ? segments[2]
      : null;
  const projectTitle = projectSlug ? formatSlugLabel(projectSlug) : "Projects";

  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full flex-1 min-h-0 overflow-y-auto">
      <p className="md:text-xl text-lg font-medium">{projectTitle}</p>
      {projectSlug ? (
        <FileItem
          id={projectSlug}
          title={projectTitle}
          currentPageSlug={currentPageSlug}
        />
      ) : (
        <p className="text-sm text-(--gray-page)">
          {isProjectsRoot
            ? "Projects will appear here once real data is connected."
            : "Open a project to see its navigation."}
        </p>
      )}
    </div>
  );
};
