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
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
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
    pages: Array<{
      id: string;
      slug: string;
      title: string;
    }>;
  };
  currentProjectSlug?: string | null;
  currentPageSlug?: string | null;
}

export const FileItem = ({
  project,
  currentProjectSlug,
  currentPageSlug,
}: SidebarItemProps) => {
  const router = useRouter();
  const createPage = useMutation(api.pages.mutations.createPage);
  const projectBasePath = "/projects/" + project.slug;
  const isActiveProject = currentProjectSlug === project.slug;
  const [itemExpanded, setItemExpanded] = useState(isActiveProject);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  useEffect(() => {
    if (isActiveProject) {
      setItemExpanded(true);
    }
  }, [isActiveProject]);

  return (
    <>
      <div
        className="rounded-lg p-1 px-1.5 gap-2 hover:bg-(--darkest-hover) w-full text-(--gray) flex items-center justify-start md:text-base text-sm"
      >
        <button onClick={() => setItemExpanded((prev) => !prev)}>
          <ChevronRight className={`${itemExpanded ? "rotate-90" : ""}`} />
        </button>
        <Link href={projectBasePath} className="w-full">
          {project.name.length > 20 ? project.name.slice(0, 20) : project.name}
        </Link>
        <Menubar className="ml-auto h-auto bg-transparent border-none shadow-none p-0">
          <MenubarMenu>
            <MenubarTrigger className=" data-highlighted:bg-transparent data-[state=open]:bg-transparent data-highlighted:text-(--light) data-[state=open]:text-(--light) py-0">
              <EllipsisVertical size={20} />
            </MenubarTrigger>
            <MenubarContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
              <MenubarGroup>
                <MenubarItem className="hover:bg-(--darkest-hover)! hover:text-(--light)!">
                  <Link
                    href={projectBasePath + "/settings"}
                    className="flex items-center justify-start gap-2"
                  >
                    <Cog />
                    Settings
                  </Link>
                </MenubarItem>
                <MenubarItem className="hover:bg-(--darkest-hover)! hover:text-(--light)! ">
                  <Link
                    href={projectBasePath + "/analytics"}
                    className="flex items-center justify-start gap-2"
                  >
                    <ChartNoAxesCombined />
                    Analytics
                  </Link>
                </MenubarItem>
              </MenubarGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <button
          disabled={isCreatingPage}
          onClick={async () => {
            if (isCreatingPage) {
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

      {itemExpanded && (
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
              <span>{page.title}</span>
            </Link>
          ))}
        </>
      )}
    </>
  );
};
