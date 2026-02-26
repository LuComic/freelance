"use client";

import { useState } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
  Folder,
  Bell,
  LogOut,
} from "lucide-react";
import { Files } from "./Files";
import { Connections } from "./Connections";
import { SidebarSettings } from "./SidebarSettings";
import { CreateProjectModal } from "@/app/lib/components/project/CreateProjectModal";
import Link from "next/link";
import { LogOutButton } from "../LogOutButton";

export const MobileSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"files" | "friends" | "settings">(
    "files",
  );
  return (
    <div className="block md:hidden">
      {sidebarOpen ? (
        <nav className="w-[363px] h-dvh max-h-dvh bg-(--darkest) border-r border-(--gray) flex flex-col items-start justify-start p-2 gap-4 fixed z-30 top-0 left-0 overflow-hidden">
          <div className="flex items-center justify-between w-full">
            <Link href="/projects" className="text-(--gray) text-xl">
              Empty Canvas
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className=" p-1 rounded-lg hover:bg-(--darkest-hover)"
            >
              <PanelLeftClose size={22} />
            </button>
          </div>

          <div className="flex items-center justify-around p-1 rounded-lg bg-(--dim) w-full gap-1">
            <button
              className={` p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                activeTab === "files"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => setActiveTab("files")}
            >
              <Folder size={20} className="mx-auto" />
            </button>
            <button
              className={` p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                activeTab === "friends"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => setActiveTab("friends")}
            >
              <Users size={20} className="mx-auto" />
            </button>
            <button
              className={` p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                activeTab === "settings"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings size={20} className="mx-auto" />
            </button>
            <CreateProjectModal buttonClassName="p-1 rounded-lg hover:bg-(--quite-dark) w-full" />
          </div>

          {activeTab === "files" ? <Files /> : null}
          {activeTab === "friends" ? <Connections /> : null}
          {activeTab === "settings" ? <SidebarSettings /> : null}
          <div className="mt-auto w-full h-max flex items-center">
            <Link
              className="w-max gap-2 flex items-center justify-start py-1 pl-2 pr-3 rounded-lg hover:bg-(--darkest-hover)"
              href="/settings?section=account"
            >
              <div className="aspect-square w-8 h-auto bg-(--dim) rounded-full"></div>
              <span className="font-light text-base">John Doe</span>
            </Link>
            <button className="ml-auto p-1 flex items-center justify-center aspect-square rounded-lg h-full hover:bg-(--darkest-hover) ">
              <Bell size={20} />
            </button>
            <LogOutButton sidebar={true} />
          </div>
        </nav>
      ) : (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-(--darkest) z-30 p-1.5 rounded-lg hover:bg-(--darkest-hover) fixed bottom-2 left-2"
        >
          <PanelLeftOpen size={24} />
        </button>
      )}
    </div>
  );
};
