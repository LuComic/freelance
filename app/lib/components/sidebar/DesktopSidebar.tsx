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
import { Tips } from "./Tips";
import { Connections } from "./Connections";

export const DesktopSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [tips, setTips] = useState(true);
  const [friends, setFriends] = useState(false);
  const [settings, setSettings] = useState(false);
  const [create, setCreate] = useState(false);

  const toggleControl = (
    toToggle: "tips" | "friends" | "settings" | "create"
  ) => {
    if (toToggle === "tips") {
      setTips(true);
      setFriends(false);
      setSettings(false);
      setCreate(false);
    } else if (toToggle == "friends") {
      setTips(false);
      setFriends(true);
      setSettings(false);
      setCreate(false);
    } else if (toToggle == "settings") {
      setTips(false);
      setFriends(false);
      setSettings(true);
      setCreate(false);
    } else if (toToggle == "create") {
      setTips(false);
      setFriends(false);
      setSettings(false);
      setCreate(true);
    }
  };
  return (
    <div className="hidden md:block">
      {sidebarOpen ? (
        <nav className="w-[300px] h-full min-h-screen bg-(--darkest) border-r border-(--gray) flex flex-col items-start justify-start p-2 px-3 gap-4">
          <div className="flex items-center justify-between w-full">
            <span className="text-(--gray) text-xl">Empty Canvas</span>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="cursor-pointer p-1 rounded-lg transition hover:bg-(--darkest-hover)"
            >
              <PanelLeftClose size={20} />
            </button>
          </div>
          <div className="flex items-center justify-around p-1 rounded-lg bg-(--dim) w-full gap-1">
            <button
              className={`cursor-pointer p-1 rounded-lg transition hover:bg-(--quite-dark) w-full ${
                tips ? "bg-(--quite-dark) text-(--vibrant)" : ""
              }`}
              onClick={() => toggleControl("tips")}
            >
              <Lightbulb size={20} className="mx-auto" />
            </button>
            <button
              className={`cursor-pointer p-1 rounded-lg transition hover:bg-(--quite-dark) w-full ${
                friends ? "bg-(--quite-dark) text-(--vibrant)" : ""
              }`}
              onClick={() => toggleControl("friends")}
            >
              <Users size={20} className="mx-auto" />
            </button>
            <button
              className={`cursor-pointer p-1 rounded-lg transition hover:bg-(--quite-dark) w-full ${
                settings ? "bg-(--quite-dark) text-(--vibrant)" : ""
              }`}
              onClick={() => toggleControl("settings")}
            >
              <Settings size={20} className="mx-auto" />
            </button>
            <button
              className={`cursor-pointer p-1 rounded-lg transition hover:bg-(--quite-dark) w-full ${
                create ? "bg-(--quite-dark) text-(--vibrant)" : ""
              }`}
              onClick={() => toggleControl("create")}
            >
              <Plus size={20} className="mx-auto" />
            </button>
          </div>
          {tips ? <Tips /> : null}
          {friends ? <Connections /> : null}
          <div className="mt-auto w-full h-max flex items-center justify-between">
            <div className="w-max gap-2 flex items-center justify-start py-1 px-2 rounded-lg transition hover:bg-(--darkest-hover) cursor-pointer">
              <div className="aspect-square w-8 h-auto bg-(--dim) rounded-full"></div>
              <span className="font-light text-sm underline underline-offset-4 decoration-(--vibrant)">
                Create an Account
              </span>
            </div>
            <button className="p-1 aspect-square rounded-lg transition h-full hover:bg-(--darkest-hover) cursor-pointer">
              <Bell size={20} />
            </button>
          </div>
        </nav>
      ) : (
        <nav className="w-[50px] h-full min-h-screen bg-(--darkest) border-r border-(--gray) flex flex-col items-center justify-start p-2 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="cursor-pointer p-1 rounded-lg transition hover:bg-(--darkest-hover)"
          >
            <PanelLeftOpen size={20} />
          </button>
          <div className="flex flex-col bg-(--dim) rounded-lg justify-center p-1 h-max gap-4">
            <button
              className={`h-full cursor-pointer p-1 rounded-lg transition hover:bg-(--quite-dark) w-full ${
                tips ? "bg-(--quite-dark)" : ""
              }`}
              onClick={() => {
                toggleControl("tips");
                setSidebarOpen(true);
              }}
            >
              <Lightbulb size={20} className="mx-auto" />
            </button>
            <button
              className={`h-full cursor-pointer p-1 rounded-lg transition hover:bg-(--quite-dark) w-full ${
                friends ? "bg-(--quite-dark)" : ""
              }`}
              onClick={() => {
                toggleControl("friends");
                setSidebarOpen(true);
              }}
            >
              <Users size={20} className="mx-auto" />
            </button>
            <button
              className={`h-full cursor-pointer p-1 rounded-lg transition hover:bg-(--quite-dark) w-full ${
                settings ? "bg-(--quite-dark)" : ""
              }`}
              onClick={() => {
                toggleControl("settings");
                setSidebarOpen(true);
              }}
            >
              <Settings size={20} className="mx-auto" />
            </button>
            <button
              className={`h-full cursor-pointer p-1 rounded-lg transition hover:bg-(--quite-dark) w-full ${
                create ? "bg-(--quite-dark)" : ""
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
            <button className="cursor-pointer p-1 rounded-lg transition hover:bg-(--quite-dark) w-full">
              <div className="aspect-square w-6 h-auto bg-(--dim) rounded-full mx-auto"></div>
            </button>
            <button className="cursor-pointer aspect-square p-1 rounded-lg transition hover:bg-(--quite-dark) w-full">
              <Bell size={20} className="mx-auto" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};
