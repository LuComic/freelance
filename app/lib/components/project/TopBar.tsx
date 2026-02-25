"use client";

import {
  Cog,
  FilePlusCorner,
  LayoutTemplate,
  Pencil,
  Radio,
  Search,
  Share,
  Trash,
} from "lucide-react";
import { useEditMode } from "./EditModeContext";
import { usePathname } from "next/navigation";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";

export const TopBar = () => {
  const { isEditing, isLive, setIsEditing, setIsLive } = useEditMode();
  const isConfig = !isEditing && !isLive;
  const pathname = usePathname();

  return (
    <div
      className={`w-full border-b border-(--gray) ${(typeof window !== undefined && pathname.includes("settings")) || pathname.includes("analytics") || pathname.includes("terms") || pathname.includes("privacy") || pathname.includes("cookies") || pathname === "/projects" ? "hidden" : "flex"} items-center justify-start gap-2 p-1.5`}
    >
      <button
        onClick={() => setIsEditing(true)}
        className={`text-sm gap-1 flex items-center justify-center p-1 lg:px-2 lg:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) ${
          isEditing
            ? "bg-(--vibrant)/20 border-(--vibrant) text-(--light)"
            : "hover:bg-(--gray)/20"
        }`}
      >
        <Pencil size={15} />
        <span className="hidden lg:inline">Edit</span>
      </button>
      <button
        onClick={() => {
          setIsEditing(false);
          setIsLive(false);
        }}
        className={`text-sm gap-1 flex items-center justify-center p-1 lg:px-2 lg:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) ${
          isConfig
            ? "bg-(--vibrant)/20 border-(--vibrant) text-(--light)"
            : "hover:bg-(--gray)/20"
        }`}
      >
        <Cog size={15} />
        <span className="hidden lg:inline">Config</span>
      </button>
      <button
        onClick={() => setIsLive(true)}
        className={`text-sm gap-1 flex items-center justify-center p-1 lg:px-2 lg:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) ${
          isLive
            ? "bg-(--vibrant)/20 border-(--vibrant) text-(--light)"
            : "hover:bg-(--gray)/20"
        }`}
      >
        <Radio size={15} />
        <span className="hidden lg:inline">Live</span>
      </button>
      <button className="text-sm gap-1 flex items-center justify-center p-1 lg:px-2 lg:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) hover:bg-(--gray)/20 ml-auto">
        <FilePlusCorner size={15} />
        <span className="hidden lg:inline">New Page</span>
      </button>
      <button className="text-sm gap-1 flex items-center justify-center p-1 lg:px-2 lg:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) hover:bg-(--gray)/20">
        <Trash size={15} />
        <span className="hidden lg:inline">Delete</span>
      </button>
      <button className="text-sm gap-1 flex items-center justify-center p-1 lg:px-2 lg:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) hover:bg-(--gray)/20">
        <Share size={15} />
        <span className="hidden lg:inline">Save template</span>
      </button>
      <Menubar className="h-auto bg-transparent border-none shadow-none p-0">
        <MenubarMenu>
          <MenubarTrigger className="data-highlighted:bg-transparent data-[state=open]:bg-transparent data-highlighted:text-(--gray-page) data-[state=open]:text-(--gray-page) py-0 text-sm flex items-center justify-center p-1 lg:px-2 lg:py-0.5 rounded-md border border-(--gray-page) hover:bg-(--gray)/20 gap-1 text-(--gray-page)">
            <LayoutTemplate size={15} />
            <span className="hidden lg:inline">Template</span>
          </MenubarTrigger>
          <MenubarContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
            <MenubarGroup>
              <MenubarItem className="hover:bg-(--darkest-hover)! hover:text-(--light)!">
                <Search size={15} />
                <span className="hidden lg:inline">Use template</span>
              </MenubarItem>
              <MenubarItem className="hover:bg-(--darkest-hover)! hover:text-(--light)!">
                <Share size={15} />
                <span className="hidden lg:inline">Save template</span>
              </MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
};
