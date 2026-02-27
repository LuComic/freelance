"use client";
import {
  ChartNoAxesCombined,
  ChevronRight,
  Cog,
  File,
  Plus,
  EllipsisVertical,
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
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
  title: string;
  id: string;
  currentPageSlug?: string | null;
}

export const FileItem = ({ title, id, currentPageSlug }: SidebarItemProps) => {
  const pathname = usePathname();
  const projectBasePath = "/projects/" + id;
  const [itemExpanded, setItemExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      if (pathname.includes(id)) return true;
    }
    return false;
  });
  return (
    <>
      <div className="rounded-lg p-1 gap-2 hover:bg-(--darkest-hover) w-full text-(--gray) flex items-center justify-start  md:text-base text-sm">
        <button onClick={() => setItemExpanded((prev) => !prev)}>
          <ChevronRight className={`${itemExpanded ? "rotate-90" : ""}`} />
        </button>
        <Link href={projectBasePath} className="w-full">
          {title.length > 20 ? title.slice(0, 20) : title}
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
        <button>
          <Plus size={20} />
        </button>
      </div>

      {itemExpanded && (
        <>
          <Link
            className="pl-8 flex w-full items-center justify-start gap-2 hover:bg-(--darkest-hover) rounded-lg p-1 md:text-base text-sm"
            href={projectBasePath}
          >
            <File size={18} />
            Overview
          </Link>
          {currentPageSlug ? (
            <Link
              className="pl-8 flex w-full items-center justify-start gap-2 hover:bg-(--darkest-hover) rounded-lg p-1 md:text-base text-sm"
              href={projectBasePath + "/" + currentPageSlug}
            >
              <File size={18} />
              {currentPageSlug}
            </Link>
          ) : null}
        </>
      )}
    </>
  );
};
