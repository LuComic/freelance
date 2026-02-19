"use client";

import { useState } from "react";
import {
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  LayoutGrid,
} from "lucide-react";

export const MobileChat = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "components">("chat");

  return (
    <div className="block md:hidden">
      {chatOpen ? (
        <nav className="w-[363px] h-full min-h-screen bg-(--darkest) border-l border-(--gray) flex flex-col items-start justify-start p-2 gap-4 fixed z-10 top-0 right-0">
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
