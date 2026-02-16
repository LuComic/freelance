"use client";

import { useState } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
  Plus,
  Lightbulb,
  Bell,
} from "lucide-react";
import { Files } from "./Files";
import { Connections } from "./Connections";
import { SidebarSettings } from "./SidebarSettings";

export const MobileSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [files, setFiles] = useState(true);
  const [friends, setFriends] = useState(false);
  const [settings, setSettings] = useState(false);
  const [create, setCreate] = useState(false);

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
    <div className="block md:hidden">
      {sidebarOpen ? (
        <nav className="w-[363px] h-full min-h-screen bg-(--darkest) border-r border-(--gray) flex flex-col items-start justify-start p-2 gap-4 fixed z-10 top-0 left-0">
          <div className="flex items-center justify-between w-full">
            <span className="text-(--gray) text-xl">Empty Canvas</span>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="cursor-pointer p-1 rounded-lg hover:bg-(--darkest-hover)"
            >
              <PanelLeftClose size={22} />
            </button>
          </div>
          <div className="flex items-center justify-around p-1 rounded-lg bg-(--dim) w-full gap-1">
            <button
              className={`cursor-pointer p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                files ? "bg-(--quite-dark) text-(--vibrant)" : ""
              }`}
              onClick={() => toggleControl("files")}
            >
              <Lightbulb size={20} className="mx-auto" />
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
            <div className="w-max gap-2 flex items-center justify-start py-1 px-2 rounded-lg hover:bg-(--darkest-hover) cursor-pointer">
              <div className="aspect-square w-8 h-auto bg-(--dim) rounded-full"></div>
              <span className="font-light text-sm">John Doe</span>
            </div>
            <button className="p-1 rounded-lg h-full hover:bg-(--darkest-hover) cursor-pointer">
              <Bell size={20} />
            </button>
          </div>
        </nav>
      ) : (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-(--darkest) cursor-pointer p-1 rounded-lg hover:bg-(--darkest-hover) fixed top-2 left-2"
        >
          <PanelLeftOpen size={24} />
        </button>
      )}
    </div>
  );
};
