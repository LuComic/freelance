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
  const [activeTab, setActiveTab] = useState<
    "files" | "friends" | "settings" | "create"
  >("files");
  return (
    <div className="block md:hidden">
      {sidebarOpen ? (
        <nav className="w-[363px] h-dvh max-h-dvh bg-(--darkest) border-r border-(--gray) flex flex-col items-start justify-start p-2 gap-4 fixed z-10 top-0 left-0 overflow-hidden">
          <div className="flex items-center justify-between w-full">
            <span className="text-(--gray) text-xl">Empty Canvas</span>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className=" p-1 rounded-lg hover:bg-(--darkest-hover)"
            >
              <PanelLeftClose size={22} />
            </button>
          </div>
          <div className="w-full flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-4">
            <div className="flex items-center justify-around p-1 rounded-lg bg-(--dim) w-full gap-1">
              <button
                className={` p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                  activeTab === "files"
                    ? "bg-(--quite-dark) text-(--vibrant)"
                    : ""
                }`}
                onClick={() => setActiveTab("files")}
              >
                <Lightbulb size={20} className="mx-auto" />
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
            <div className="w-max gap-2 flex items-center justify-start py-1 px-2 rounded-lg hover:bg-(--darkest-hover) ">
              <div className="aspect-square w-8 h-auto bg-(--dim) rounded-full"></div>
              <span className="font-light text-sm">John Doe</span>
            </div>
            <button className="p-1 rounded-lg h-full hover:bg-(--darkest-hover) ">
              <Bell size={20} />
            </button>
          </div>
        </nav>
      ) : (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-(--darkest)  p-1 rounded-lg hover:bg-(--darkest-hover) fixed top-2 left-2"
        >
          <PanelLeftOpen size={24} />
        </button>
      )}
    </div>
  );
};
