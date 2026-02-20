"use client";

import { useState } from "react";
import {
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  LayoutGrid,
} from "lucide-react";
import { ComponentLib, type ComponentTag } from "./ComponentLib";

export const MobileChat = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "components">("chat");
  const [componentFilter, setComponentFilter] = useState<"" | ComponentTag>("");

  const changeComponentFilter = (newFilter: ComponentTag) => {
    if (componentFilter === newFilter) {
      setComponentFilter("");
      return;
    }

    setComponentFilter(newFilter);
  };

  return (
    <div className="block md:hidden">
      {chatOpen ? (
        <nav className="w-[363px] h-dvh max-h-dvh bg-(--darkest) border-l border-(--gray) flex flex-col items-start justify-start p-2 gap-4 fixed z-10 top-0 right-0 overflow-hidden">
          <div className="flex items-center justify-start gap-2 w-full">
            <button
              onClick={() => setChatOpen(false)}
              className=" p-1 rounded-lg hover:bg-(--darkest-hover)"
            >
              <PanelRightClose size={22} />
            </button>
            <span className="text-(--gray) text-xl">Chat</span>
          </div>

          <div className="flex items-center justify-around p-1 rounded-lg bg-(--dim) w-full gap-1">
            <button
              className={` p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                activeTab === "chat" ? "bg-(--quite-dark) text-(--vibrant)" : ""
              }`}
              onClick={() => setActiveTab("chat")}
            >
              <MessageSquare size={20} className="mx-auto" />
            </button>
            <button
              className={` p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                activeTab === "components"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => setActiveTab("components")}
            >
              <LayoutGrid size={20} className="mx-auto" />
            </button>
          </div>
          <div className="w-full flex-1 min-h-0 overflow-y-auto pr-1">
            {activeTab === "components" ? (
              <>
                <div className="flex flex-wrap items-center justify-start gap-2 w-full mb-2">
                  {(
                    ["progress", "text", "input", "feedback"] as ComponentTag[]
                  ).map((tag) => (
                    <button
                      key={tag}
                      className={`text-sm gap-1 flex items-center justify-center px-2 py-0.5 rounded-md border border-(--gray) hover:bg-(--gray)/20 ${
                        componentFilter !== tag ? "text-(--gray-page)" : ""
                      }`}
                      onClick={() => changeComponentFilter(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <ComponentLib filterTag={componentFilter} />
              </>
            ) : null}
          </div>
        </nav>
      ) : (
        <button
          onClick={() => setChatOpen(true)}
          className="bg-(--darkest)  p-1 rounded-lg hover:bg-(--darkest-hover) fixed top-2 right-2"
        >
          <PanelRightOpen size={24} />
        </button>
      )}
    </div>
  );
};
