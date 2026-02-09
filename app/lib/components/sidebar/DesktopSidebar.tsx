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

  const [files, setFiles] = useState(true);
  const [friends, setFriends] = useState(false);
  const [settings, setSettings] = useState(false);
  const [create, setCreate] = useState(false);

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

  const toggleControl = (
    toToggle: "files" | "friends" | "settings" | "create",
  ) => {
    if (toToggle === "files") {
      setFiles(true);
      setFriends(false);
      setSettings(false);
      setCreate(false);
    } else if (toToggle == "friends") {
      setFiles(false);
      setFriends(true);
      setSettings(false);
      setCreate(false);
    } else if (toToggle == "settings") {
      setFiles(false);
      setFriends(false);
      setSettings(true);
      setCreate(false);
    } else if (toToggle == "create") {
      setFiles(false);
      setFriends(false);
      setSettings(false);
      setCreate(true);
    }
  };

  return (
    <div className="hidden md:block">
      {sidebarOpen ? (
        <nav className="w-[363px] h-full min-h-screen bg-(--darkest) border-r border-(--gray) flex flex-col items-start justify-start p-2 px-3 gap-4">
          <div className="flex items-center justify-between w-full">
            <span className="text-(--gray) text-xl">Empty Canvas</span>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="cursor-pointer p-1 rounded-lg hover:bg-(--darkest-hover)"
            >
              <PanelLeftClose size={20} />
            </button>
          </div>
          <div className="flex items-center justify-around p-1 rounded-xl bg-(--dim) w-full gap-1">
            <button
              className={`cursor-pointer p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                files ? "bg-(--quite-dark) text-(--vibrant)" : ""
              }`}
              onClick={() => toggleControl("files")}
            >
              <Folder size={20} className="mx-auto" />
            </button>
            <button
              className={`cursor-pointer p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                friends ? "bg-(--quite-dark) text-(--vibrant)" : ""
              }`}
              onClick={() => toggleControl("friends")}
            >
              <Users size={20} className="mx-auto" />
            </button>
            <button
              className={`cursor-pointer p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                settings ? "bg-(--quite-dark) text-(--vibrant)" : ""
              }`}
              onClick={() => toggleControl("settings")}
            >
              <Settings size={20} className="mx-auto" />
            </button>
            <button
              className={`cursor-pointer p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                create ? "bg-(--quite-dark) text-(--vibrant)" : ""
              }`}
              onClick={() => toggleControl("create")}
            >
              <Plus size={20} className="mx-auto" />
            </button>
          </div>
          {files ? <Files /> : null}
          {friends ? <Connections /> : null}
          {settings ? <SidebarSettings /> : null}
          <div className="mt-auto w-full h-max flex items-center justify-between">
            <div className="w-max gap-2 flex items-center justify-start py-1 pl-2 pr-3 rounded-lg hover:bg-(--darkest-hover) cursor-pointer">
              <div className="aspect-square w-8 h-auto bg-(--dim) rounded-full"></div>
              <span className="font-light text-base">John Doe</span>
            </div>
            <button className="p-1 aspect-square rounded-lg h-full hover:bg-(--darkest-hover) cursor-pointer">
              <Bell size={20} />
            </button>
          </div>
        </nav>
      ) : (
        <nav className="w-[50px] h-full min-h-screen bg-(--darkest) border-r border-(--gray) flex flex-col items-center justify-start p-2 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="cursor-pointer p-1 rounded-lg hover:bg-(--darkest-hover)"
          >
            <PanelLeftOpen size={20} />
          </button>
          <div className="flex flex-col bg-(--dim) rounded-lg justify-center p-1 h-max gap-4">
            <button
              className={`h-full cursor-pointer p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                files ? "bg-(--quite-dark) text-(--vibrant)" : ""
              }`}
              onClick={() => {
                toggleControl("files");
                setSidebarOpen(true);
              }}
            >
              <Folder size={20} className="mx-auto" />
            </button>
            <button
              className={`h-full cursor-pointer p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                friends ? "bg-(--quite-dark) text-(--vibrant)" : ""
              }`}
              onClick={() => {
                toggleControl("friends");
                setSidebarOpen(true);
              }}
            >
              <Users size={20} className="mx-auto" />
            </button>
            <button
              className={`h-full cursor-pointer p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                settings ? "bg-(--quite-dark) text-(--vibrant)" : ""
              }`}
              onClick={() => {
                toggleControl("settings");
                setSidebarOpen(true);
              }}
            >
              <Settings size={20} className="mx-auto" />
            </button>
            <button
              className={`h-full cursor-pointer p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                create ? "bg-(--quite-dark) text-(--vibrant)" : ""
              }`}
              onClick={() => {
                toggleControl("create");
                setSidebarOpen(true);
              }}
            >
              <Plus size={20} className="mx-auto" />
            </button>
          </div>
          <div className="flex flex-col gap-2 items-center justify-center mt-auto w-full">
            <button className="cursor-pointer p-1 rounded-lg hover:bg-(--darkest-hover) w-full">
              <div className="aspect-square w-6 h-auto bg-(--dim) rounded-full mx-auto"></div>
            </button>
            <button className="cursor-pointer aspect-square p-1 rounded-lg transition hover:bg-(--darkest-hover) w-full">
              <Bell size={20} className="mx-auto" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};
