"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  LayoutGrid,
} from "lucide-react";
import { CHAT_COOKIE, setCookie } from "@/app/lib/cookies";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { ComponentLib, type ComponentTag } from "./ComponentLib";

type DesktopChatProps = {
  initialOpen?: boolean;
};

export const DesktopChat = ({ initialOpen }: DesktopChatProps) => {
  const {
    isEditing,
    modeLock,
    requestComponentInsert,
    componentLibraryOpenRequestNonce,
  } = useEditMode();
  const [chatOpen, setChatOpen] = useState(initialOpen ?? false);
  const [activeTab, setActiveTab] = useState<"chat" | "components">("chat");
  const [componentFilter, setComponentFilter] = useState<"" | ComponentTag>("");
  const handledComponentLibraryNonceRef = useRef(0);
  const componentsLocked = modeLock === "live";
  const visibleActiveTab = componentsLocked ? "chat" : activeTab;

  useEffect(() => {
    setCookie(CHAT_COOKIE, String(chatOpen));
  }, [chatOpen]);

  useEffect(() => {
    const onKeyDownHandler = (e: KeyboardEvent) => {
      if (
        (e.key === "l" || e.key === "L") &&
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey
      ) {
        setChatOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", onKeyDownHandler);
    return () => document.removeEventListener("keydown", onKeyDownHandler);
  }, []);

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
      setChatOpen(true);
      setActiveTab("components");
    });
  }, [componentLibraryOpenRequestNonce, componentsLocked]);

  const changeComponentFilter = (newFilter: ComponentTag) => {
    if (componentFilter === newFilter) {
      setComponentFilter("");
      return;
    }

    setComponentFilter(newFilter);
  };

  return (
    <div className="hidden md:block self-stretch">
      {chatOpen ? (
        <div className="w-[491px] h-full min-h-dvh bg-(--darkest) border-l border-(--gray) flex flex-col items-start justify-start p-2 px-3 gap-4 overflow-hidden">
          <div className="flex items-center justify-start gap-2 w-full">
            <button
              onClick={() => setChatOpen(false)}
              className=" p-1 rounded-lg hover:bg-(--darkest-hover)"
            >
              <PanelRightClose size={20} />
            </button>
            <span className="text-(--gray) text-xl">
              {visibleActiveTab === "chat" ? "Chat" : "Components"}
            </span>
          </div>

          <div className="flex items-center justify-around p-1 rounded-xl bg-(--dim) w-full gap-1">
            <button
              className={` p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                visibleActiveTab === "chat"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => setActiveTab("chat")}
            >
              <MessageSquare size={20} className="mx-auto" />
            </button>
            {!componentsLocked ? (
              <button
                className={` p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                  visibleActiveTab === "components"
                    ? "bg-(--quite-dark) text-(--vibrant)"
                    : ""
                }`}
                onClick={() => setActiveTab("components")}
              >
                <LayoutGrid size={20} className="mx-auto" />
              </button>
            ) : null}
          </div>

          <div className="w-full flex-1 min-h-0 overflow-y-auto">
            {visibleActiveTab === "components" ? (
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
          </div>
        </div>
      ) : (
        <div className="w-[50px] h-full min-h-dvh bg-(--darkest) border-l border-(--gray) flex flex-col items-center justify-start p-2 gap-4">
          <button
            onClick={() => setChatOpen(true)}
            className=" p-1 rounded-lg hover:bg-(--darkest-hover)"
          >
            <PanelRightOpen size={20} />
          </button>
          <div className="flex flex-col bg-(--dim) rounded-lg justify-center p-1 h-max gap-4">
            <button
              className={`h-full  p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                visibleActiveTab === "chat"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("chat");
                setChatOpen(true);
              }}
            >
              <MessageSquare size={20} className="mx-auto" />
            </button>
            {!componentsLocked ? (
              <button
                className={`h-full  p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                  visibleActiveTab === "components"
                    ? "bg-(--quite-dark) text-(--vibrant)"
                    : ""
                }`}
                onClick={() => {
                  setActiveTab("components");
                  setChatOpen(true);
                }}
              >
                <LayoutGrid size={20} className="mx-auto" />
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
