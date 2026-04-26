"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import {
  PanelRightClose,
  LayoutGrid,
  LibraryBig,
  Component,
  Settings2,
  MessageSquare,
} from "lucide-react";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { ComponentLib, type ComponentTag } from "./ComponentLib";
import { ProjectChatPanel } from "./ProjectChatPanel";
import { SelectedComponentConfig } from "./SelectedComponentConfig";

type ChatTab = "components" | "config" | "messages";

type MobileChatProps = {
  projectId: string | null;
};

export const MobileChat = ({ projectId }: MobileChatProps) => {
  const {
    isEditing,
    modeLock,
    requestComponentInsert,
    componentLibraryOpenRequestNonce,
    componentConfigOpenRequestNonce,
  } = useEditMode();
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ChatTab>("components");
  const [componentFilter, setComponentFilter] = useState<"" | ComponentTag>("");
  const handledComponentLibraryNonceRef = useRef(0);
  const handledComponentConfigNonceRef = useRef(0);
  const componentsLocked = modeLock === "live";

  const changeComponentFilter = (newFilter: ComponentTag) => {
    if (componentFilter === newFilter) {
      setComponentFilter("");
      return;
    }

    setComponentFilter(newFilter);
  };

  useEffect(() => {
    if (
      componentsLocked ||
      componentLibraryOpenRequestNonce === 0 ||
      componentLibraryOpenRequestNonce ===
        handledComponentLibraryNonceRef.current
    ) {
      return;
    }

    handledComponentLibraryNonceRef.current = componentLibraryOpenRequestNonce;
    startTransition(() => {
      setActiveTab("components");
      setChatOpen(true);
    });
  }, [componentLibraryOpenRequestNonce, componentsLocked]);

  useEffect(() => {
    if (
      componentConfigOpenRequestNonce === 0 ||
      componentConfigOpenRequestNonce === handledComponentConfigNonceRef.current
    ) {
      return;
    }

    handledComponentConfigNonceRef.current = componentConfigOpenRequestNonce;
    startTransition(() => {
      setActiveTab("config");
      setChatOpen(true);
    });
  }, [componentConfigOpenRequestNonce]);

  return (
    <div>
      {chatOpen ? (
        <nav className="w-[90%] h-dvh max-h-dvh bg-(--darkest) border-l border-(--gray) flex flex-col items-start justify-start p-2 gap-4 fixed z-30 top-0 right-0 overflow-hidden">
          <div className="flex items-center justify-start gap-2 w-full">
            <button
              onClick={() => setChatOpen(false)}
              className=" p-1 rounded-lg hover:bg-(--darkest-hover)"
            >
              <PanelRightClose size={22} />
            </button>
            <span className="text-(--gray) text-xl">
              {activeTab === "components"
                ? "Components"
                : activeTab === "config"
                  ? "Config"
                  : "Messages"}
            </span>
          </div>

          <div className="flex items-center justify-around p-1 rounded-lg bg-(--dim) w-full gap-1">
            <button
              className={`p-1 rounded-lg hover:bg-(--quite-dark) w-full text-sm ${
                activeTab === "components"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => setActiveTab("components")}
              type="button"
            >
              <Component size={20} className="mx-auto" />
            </button>
            <button
              className={`p-1 rounded-lg hover:bg-(--quite-dark) w-full text-sm ${
                activeTab === "config"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => setActiveTab("config")}
              type="button"
            >
              <Settings2 size={20} className="mx-auto" />
            </button>
            <button
              className={`p-1 rounded-lg hover:bg-(--quite-dark) w-full text-sm ${
                activeTab === "messages"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => setActiveTab("messages")}
              type="button"
            >
              <MessageSquare size={20} className="mx-auto" />
            </button>
          </div>

          <div className="w-full flex-1 min-h-0 overflow-y-auto">
            {activeTab === "components" && !componentsLocked ? (
              <>
                <div className="flex flex-wrap items-center justify-start gap-2 w-full mb-2">
                  {(
                    ["progress", "text", "input", "util"] as ComponentTag[]
                  ).map((tag) => (
                    <button
                      key={tag}
                      className={`text-sm gap-1 flex items-center justify-center px-2 py-0.5 rounded-md border hover:bg-(--gray)/20 ${
                        componentFilter !== tag
                          ? "text-(--gray) border-(--gray)"
                          : ""
                      }`}
                      onClick={() => changeComponentFilter(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <ComponentLib
                  filterTag={componentFilter}
                  onInsertComponent={(command) => {
                    if (!isEditing) return;
                    requestComponentInsert(command);
                  }}
                />
              </>
            ) : null}
            {activeTab === "config" ? <SelectedComponentConfig /> : null}
            {activeTab === "messages" ? (
              <ProjectChatPanel projectId={projectId} />
            ) : null}
          </div>
        </nav>
      ) : (
        <button
          onClick={() => setChatOpen(true)}
          className="bg-(--darkest) z-30 p-2 rounded-lg hover:bg-(--darkest-hover) fixed bottom-2 right-2"
        >
          {!componentsLocked ? (
            <LibraryBig size={24} />
          ) : (
            <LayoutGrid size={24} />
          )}
        </button>
      )}
    </div>
  );
};
