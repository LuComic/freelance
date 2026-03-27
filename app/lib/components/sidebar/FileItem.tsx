"use client";
import {
  ChartNoAxesCombined,
  ChevronRight,
  Cog,
  File,
  Plus,
  EllipsisVertical,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { currentEntitlementsQuery } from "@/lib/convexFunctionReferences";
import { useMutation, useQuery } from "convex/react";
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

interface SidebarItemProps {
  project: {
    id: string;
    slug: string;
    name: string;
    viewerRole: "owner" | "coCreator" | "client";
    pages: Array<{
      id: string;
      slug: string;
      title: string;
    }>;
  };
  currentPageSlug?: string | null;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export const FileItem = ({
  project,
  currentPageSlug,
  isExpanded,
  onToggleExpanded,
}: SidebarItemProps) => {
  const router = useRouter();
  const createPage = useMutation(api.pages.mutations.createPage);
  const entitlements = useQuery(currentEntitlementsQuery, {});
  const projectBasePath = "/projects/" + project.slug;
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const isCreatePageDisabled =
    isCreatingPage || project.viewerRole === "client";
  const canAccessAnalytics = entitlements?.canAccessAnalytics === true;

  return (
    <>
      <div className="rounded-lg p-1 px-1.5 gap-2 hover:bg-(--darkest-hover) w-full text-(--gray) flex items-center justify-start md:text-base text-sm">
        <button onClick={onToggleExpanded}>
          <ChevronRight className={`${isExpanded ? "rotate-90" : ""}`} />
        </button>
        <Link href={projectBasePath} className="w-full md:inline hidden">
          {project.name.length > 20
            ? project.name.slice(0, 20) + "..."
            : project.name}
        </Link>
        <Link href={projectBasePath} className="w-full md:hidden inline">
          {project.name.length > 30
            ? project.name.slice(0, 30) + "..."
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
                  className="hover:bg-(--darkest-hover)! hover:text-(--light)!"
                >
                  <Link
                    href={projectBasePath + "/settings"}
                    className="flex items-center justify-start gap-2"
                  >
                    <Cog />
                    Settings
                  </Link>
                </MenubarItem>
                {canAccessAnalytics ? (
                  <MenubarItem
                    asChild
                    className="hover:bg-(--darkest-hover)! hover:text-(--light)! "
                  >
                    <Link
                      href={projectBasePath + "/analytics"}
                      className="flex items-center justify-start gap-2"
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
                projectId: project.id as never,
              });
              router.push(`${projectBasePath}/${result.pageSlug}`);
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
            <Link
              key={page.id}
              className={`pl-8 flex w-full items-center justify-start gap-2 rounded-lg p-1 md:text-base text-sm ${
                page.slug === currentPageSlug
                  ? "bg-(--darkest-hover) text-(--light)"
                  : "hover:bg-(--darkest-hover)"
              }`}
              href={projectBasePath + "/" + page.slug}
            >
              <File size={18} />
              <span className="hidden md:inline">
                {page.title.length > 20
                  ? page.title.slice(0, 20) + "..."
                  : page.title}
              </span>
              <span className="inline md:hidden">
                {page.title.length > 30
                  ? page.title.slice(0, 30) + "..."
                  : page.title}
              </span>
            </Link>
          ))}
        </>
      )}
    </>
  );
};
