"use client";

import {
  ChartNoAxesCombined,
  ChevronRight,
  Cog,
  File,
  Plus,
  EllipsisVertical,
  Eye,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  getProjectAnalyticsPath,
  getProjectPagePath,
  getProjectPath,
  getProjectSettingsPath,
} from "../project/paths";
import { usePageQueryPreloader } from "../project/usePageQueryPreloader";

interface SidebarItemProps {
  project: {
    id: string;
    name: string;
    viewerRole: "owner" | "coCreator" | "client";
    pages: Array<{
      id: string;
      title: string;
    }>;
  };
  currentPageId?: string | null;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  closeSidebar?: () => void;
}

export const FileItem = ({
  project,
  currentPageId,
  isExpanded,
  onToggleExpanded,
  closeSidebar,
}: SidebarItemProps) => {
  const router = useRouter();
  const preloadPage = usePageQueryPreloader();
  const createPage = useMutation(api.pages.mutations.createPage);
  const projectBasePath = getProjectPath(project.id);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const isCreatePageDisabled =
    isCreatingPage || project.viewerRole === "client";
  const canViewAnalytics = project.viewerRole !== "client";

  return (
    <>
      <div className="rounded-lg p-1 px-1.5 gap-2 hover:bg-(--darkest-hover) w-full text-(--gray) flex items-center justify-start text-base">
        <button onClick={onToggleExpanded}>
          <ChevronRight className={`${isExpanded ? "rotate-90" : ""}`} />
        </button>
        <Link href={projectBasePath} className="w-full" onClick={closeSidebar}>
          {project.name.length > 20
            ? project.name.slice(0, 20) + "..."
            : project.name}
        </Link>
        <Menubar className="ml-auto h-auto bg-transparent border-none shadow-none p-0">
          <MenubarMenu>
            <MenubarTrigger className="data-highlighted:bg-transparent data-[state=open]:bg-transparent data-highlighted:text-(--gray) data-[state=open]:text-(--gray) py-0">
              <EllipsisVertical size={20} />
            </MenubarTrigger>
            <MenubarContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
              <MenubarGroup>
                <MenubarItem
                  asChild
                  className="hover:bg-(--darkest)! hover:text-(--light)!"
                >
                  <Link
                    href={getProjectSettingsPath(project.id)}
                    className="flex items-center justify-start gap-2"
                    onClick={closeSidebar}
                  >
                    <Cog />
                    Settings
                  </Link>
                </MenubarItem>
                {canViewAnalytics ? (
                  <MenubarItem
                    asChild
                    className="hover:bg-(--darkest)! hover:text-(--light)! "
                  >
                    <Link
                      href={getProjectAnalyticsPath(project.id)}
                      className="flex items-center justify-start gap-2"
                      onClick={closeSidebar}
                    >
                      <ChartNoAxesCombined />
                      Analytics
                    </Link>
                  </MenubarItem>
                ) : (
                  <MenubarItem
                    disabled
                    className="cursor-not-allowed opacity-50"
                  >
                    <ChartNoAxesCombined />
                    Analytics
                  </MenubarItem>
                )}
              </MenubarGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <button
          type="button"
          disabled={isCreatePageDisabled}
          className="disabled:cursor-not-allowed"
          onClick={async () => {
            if (isCreatePageDisabled) {
              return;
            }

            setIsCreatingPage(true);
            try {
              const result = await createPage({
                projectId: project.id as Id<"projects">,
              });
              closeSidebar?.();
              router.push(getProjectPagePath(project.id, result.pageId));
            } finally {
              setIsCreatingPage(false);
            }
          }}
        >
          <Plus size={20} />
        </button>
      </div>

      {isExpanded && (
        <>
          {project.pages.map((page) => (
            <div
              className={`pl-8 flex hover:bg-(--darkest-hover) w-full items-center justify-start gap-2 ${page.id === currentPageId ? "bg-(--darkest-hover)" : null} w-full rounded-lg p-1`}
              key={page.id}
            >
              <button
                className={`hover:text-(--vibrant) ${page.id === currentPageId ? "text-(--light)" : "text-(--gray-page)"}`}
              >
                <Eye size={18} className="currentColor" />
              </button>
              <Link
                href={getProjectPagePath(project.id, page.id)}
                prefetch={false}
                className={`text-base ${
                  page.id === currentPageId
                    ? "text-(--light)"
                    : "text-(--gray-page)"
                }`}
                onMouseEnter={() => preloadPage(project.id, page.id)}
                onFocus={() => preloadPage(project.id, page.id)}
                onClick={closeSidebar}
              >
                {page.title.length > 20
                  ? page.title.slice(0, 20) + "..."
                  : page.title}
              </Link>
            </div>
          ))}
        </>
      )}
    </>
  );
};
