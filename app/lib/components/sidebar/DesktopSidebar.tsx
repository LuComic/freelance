"use client";

import { useState, useEffect } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Plus,
  Settings,
  Bell,
  Folder,
} from "lucide-react";
import { Files } from "./Files";
import { Connections } from "./Connections";
import { SidebarSettings } from "./SidebarSettings";
import { setCookie, SIDEBAR_COOKIE } from "@/app/lib/cookies";

type DesktopSidebarProps = {
  initialOpen?: boolean;
};

export const DesktopSidebar = ({ initialOpen }: DesktopSidebarProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(initialOpen ?? true);
  const [activeTab, setActiveTab] = useState<
    "files" | "friends" | "settings" | "create"
  >("files");

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
        <nav className="w-[363px] h-dvh max-h-dvh bg-(--darkest) border-r border-(--gray) flex flex-col items-start justify-start p-2 px-3 gap-4 overflow-hidden">
          <div className="flex items-center justify-between w-full">
            <span className="text-(--gray) text-xl">Empty Canvas</span>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className=" p-1 rounded-lg hover:bg-(--darkest-hover)"
            >
              <PanelLeftClose size={20} />
            </button>
          </div>
          <div className="w-full flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-4">
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
                className={` p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                  activeTab === "settings"
                    ? "bg-(--quite-dark) text-(--vibrant)"
                    : ""
                }`}
                onClick={() => setActiveTab("settings")}
              >
                <Settings size={20} className="mx-auto" />
              </button>
              <button
                className={` p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                  activeTab === "create"
                    ? "bg-(--quite-dark) text-(--vibrant)"
                    : ""
                }`}
                onClick={() => setActiveTab("create")}
              >
                <Plus size={20} className="mx-auto" />
              </button>
            </div>
            {activeTab === "files" ? <Files /> : null}
            {activeTab === "friends" ? <Connections /> : null}
            {activeTab === "settings" ? <SidebarSettings /> : null}
          </div>
          <div className="mt-auto w-full h-max flex items-center justify-between">
            <div className="w-max gap-2 flex items-center justify-start py-1 pl-2 pr-3 rounded-lg hover:bg-(--darkest-hover) ">
              <div className="aspect-square w-8 h-auto bg-(--dim) rounded-full"></div>
              <span className="font-light text-base">John Doe</span>
            </div>
            <button className="p-1 aspect-square rounded-lg h-full hover:bg-(--darkest-hover) ">
              <Bell size={20} />
            </button>
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
            <button
              className={`h-full  p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                activeTab === "create"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("create");
                setSidebarOpen(true);
              }}
            >
              <Plus size={20} className="mx-auto" />
            </button>
          </div>
          <div className="flex flex-col gap-2 items-center justify-center mt-auto w-full">
            <button className=" p-1 rounded-lg hover:bg-(--darkest-hover) w-full">
              <div className="aspect-square w-6 h-auto bg-(--dim) rounded-full mx-auto"></div>
            </button>
            <button className=" aspect-square p-1 rounded-lg hover:bg-(--darkest-hover) w-full">
              <Bell size={20} className="mx-auto" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};
