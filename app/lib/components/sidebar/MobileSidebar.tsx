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

export const MobileSidebar = () => {
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
    <div className="block md:hidden">
      {sidebarOpen ? (
        <nav className="w-[363px] h-full min-h-screen bg-(--darkest) border-r border-(--gray) flex flex-col items-start justify-start p-2 gap-4 fixed top-0 left-0">
          <div className="flex items-center justify-between w-full">
            <span className="text-(--gray) text-xl">Empty Canvas</span>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="cursor-pointer p-1 rounded-lg transition hover:bg-(--darkest-hover)"
            >
              <PanelLeftClose size={22} />
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
            <button className="p-1 rounded-lg transition h-full hover:bg-(--darkest-hover) cursor-pointer">
              <Bell size={20} />
            </button>
          </div>
        </nav>
      ) : (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-(--darkest) cursor-pointer p-1 rounded-lg transition hover:bg-(--darkest-hover) fixed top-2 left-2"
        >
          <PanelLeftOpen size={24} />
        </button>
      )}
    </div>
  );
};
