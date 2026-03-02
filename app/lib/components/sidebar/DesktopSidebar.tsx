"use client";

import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Settings,
  Bell,
  Folder,
} from "lucide-react";
import { Files } from "./Files";
import { Connections } from "./Connections";
import { SidebarSettings } from "./SidebarSettings";
import { setCookie, SIDEBAR_COOKIE } from "@/app/lib/cookies";
import { CreateProjectModal } from "@/app/lib/components/project/CreateProjectModal";
import Link from "next/link";
import { LogOutButton } from "../LogOutButton";
import { SidebarUserInfo, type SidebarUserProfile } from "./SidebarUserInfo";

type DesktopSidebarProps = {
  initialOpen?: boolean;
  userProfile: SidebarUserProfile;
};

export const DesktopSidebar = ({
  initialOpen,
  userProfile,
}: DesktopSidebarProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(initialOpen ?? true);
  const [activeTab, setActiveTab] = useState<"files" | "friends" | "settings">(
    "files",
  );
  const connections = useQuery(api.connections.queries.listSidebarConnections);

  useEffect(() => {
    setCookie(SIDEBAR_COOKIE, String(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    const onKeyDownHandler = (e: KeyboardEvent) => {
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        setSidebarOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDownHandler);

    return () => document.removeEventListener("keydown", onKeyDownHandler);
  }, []);

  return (
    <div className="hidden md:block self-stretch">
      {sidebarOpen ? (
        <nav className="w-[363px] h-full min-h-dvh bg-(--darkest) border-r border-(--gray) flex flex-col items-start justify-start p-2 px-3 gap-4 overflow-hidden">
          <div className="flex items-center justify-between w-full">
            <Link href="/projects" className="text-(--gray) text-xl">
              Empty Canvas
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className=" p-1 rounded-lg hover:bg-(--darkest-hover)"
            >
              <PanelLeftClose size={20} />
            </button>
          </div>
          <div className="flex items-center justify-around p-1 rounded-xl bg-(--dim) w-full gap-1">
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
              className={`p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                activeTab === "settings"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings size={20} className="mx-auto" />
            </button>
            <CreateProjectModal />
          </div>
          {activeTab === "files" ? <Files /> : null}
          {activeTab === "friends" ? (
            <Connections connections={connections} />
          ) : null}
          {activeTab === "settings" ? <SidebarSettings /> : null}
          <div className="mt-auto w-full h-max flex items-center">
            <SidebarUserInfo profile={userProfile} />
            <Link
              className="ml-auto p-1 flex items-center justify-center aspect-square rounded-lg h-full hover:bg-(--darkest-hover) notification relative"
              href="/notifications"
            >
              <Bell size={20} />
            </Link>
            <LogOutButton sidebar={true} />
          </div>
        </nav>
      ) : (
        <nav className="w-[50px] h-full min-h-screen bg-(--darkest) border-r border-(--gray) flex flex-col items-center justify-start p-2 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className=" p-1 rounded-lg hover:bg-(--darkest-hover)"
          >
            <PanelLeftOpen size={20} />
          </button>
          <div className="flex flex-col bg-(--dim) rounded-lg justify-center p-1 h-max gap-4">
            <button
              className={`h-full  p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                activeTab === "files"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("files");
                setSidebarOpen(true);
              }}
            >
              <Folder size={20} className="mx-auto" />
            </button>
            <button
              className={`h-full  p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                activeTab === "friends"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("friends");
                setSidebarOpen(true);
              }}
            >
              <Users size={20} className="mx-auto" />
            </button>
            <button
              className={`h-full  p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                activeTab === "settings"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("settings");
                setSidebarOpen(true);
              }}
            >
              <Settings size={20} className="mx-auto" />
            </button>
            <CreateProjectModal />
          </div>
          <div className="flex flex-col gap-2 items-center justify-center mt-auto w-full">
            <SidebarUserInfo profile={userProfile} compact={true} />
            <button className=" aspect-square p-1 rounded-lg hover:bg-(--darkest-hover) w-full">
              <Bell size={20} className="mx-auto" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};
