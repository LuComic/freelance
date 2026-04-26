"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import {
  PanelRightClose,
  PanelRightOpen,
  LayoutGrid,
  Component,
  Settings2,
  MessageSquare,
} from "lucide-react";
import { CHAT_COOKIE, CHAT_WIDTH_COOKIE, setCookie } from "@/app/lib/cookies";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { useResizablePanelWidth } from "@/app/lib/hooks/useResizablePanelWidth";
import { useDesktopPanelLayout } from "../project/DesktopPanelLayoutContext";
import {
  CHAT_DEFAULT_WIDTH,
  CHAT_MAX_WIDTH,
  CHAT_MIN_WIDTH,
} from "../project/desktopPanelSizing";
import { ComponentLib, type ComponentTag } from "./ComponentLib";
import { ProjectChatPanel } from "./ProjectChatPanel";
import { SelectedComponentConfig } from "./SelectedComponentConfig";

type DesktopChatProps = {
  initialOpen?: boolean;
  initialWidth?: number;
  projectId: string | null;
};

type ChatTab = "components" | "config" | "messages";

export const DesktopChat = ({
  initialOpen,
  initialWidth,
  projectId,
}: DesktopChatProps) => {
  const {
    isEditing,
    modeLock,
    requestComponentInsert,
    componentLibraryOpenRequestNonce,
    componentConfigOpenRequestNonce,
  } = useEditMode();
  const [chatOpen, setChatOpen] = useState(initialOpen ?? false);
  const [activeTab, setActiveTab] = useState<ChatTab>("components");
  const [componentFilter, setComponentFilter] = useState<"" | ComponentTag>("");
  const handledComponentLibraryNonceRef = useRef(0);
  const handledComponentConfigNonceRef = useRef(0);
  const componentsLocked = modeLock === "live";
  const {
    chatWidth,
    setChatWidth,
    setChatOpen: setSharedChatOpen,
  } = useDesktopPanelLayout();
  const { width, widthStyle, startResize, resizeByKeyboard } =
    useResizablePanelWidth({
      cookieName: CHAT_WIDTH_COOKIE,
      defaultWidth: CHAT_DEFAULT_WIDTH,
      initialWidth,
      minWidth: CHAT_MIN_WIDTH,
      maxWidth: CHAT_MAX_WIDTH,
      resizeEdge: "left",
      width: chatWidth,
      onWidthChange: setChatWidth,
    });

  useEffect(() => {
    setCookie(CHAT_COOKIE, String(chatOpen));
  }, [chatOpen]);

  useEffect(() => {
    setSharedChatOpen(chatOpen);
  }, [chatOpen, setSharedChatOpen]);

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

  const changeComponentFilter = (newFilter: ComponentTag) => {
    if (componentFilter === newFilter) {
      setComponentFilter("");
      return;
    }

    setComponentFilter(newFilter);
  };

  return (
    <div className="self-stretch">
      {chatOpen ? (
        <div
          className="relative shrink-0 h-full min-h-dvh bg-(--darkest) border-l border-(--gray) flex flex-col items-start justify-start p-2 px-3 gap-4 overflow-hidden"
          style={widthStyle}
        >
          <div
            role="separator"
            aria-label="Resize chat panel"
            aria-orientation="vertical"
            aria-valuemin={CHAT_MIN_WIDTH}
            aria-valuemax={CHAT_MAX_WIDTH}
            aria-valuenow={width}
            tabIndex={0}
            onPointerDown={startResize}
            onKeyDown={resizeByKeyboard}
            className="absolute top-0 left-0 z-10 h-full w-2 cursor-ew-resize touch-none bg-transparent"
          />
          <div className="flex items-center justify-start gap-2 w-full">
            <button
              onClick={() => setChatOpen(false)}
              className=" p-1 rounded-lg hover:bg-(--darkest-hover)"
            >
              <PanelRightClose size={20} />
            </button>
            <span className="text-(--gray) text-xl">
              {activeTab === "components"
                ? "Components"
                : activeTab === "config"
                  ? "Config"
                  : "Messages"}
            </span>
          </div>

          <div className="flex items-center justify-around p-1 rounded-xl bg-(--dim) w-full gap-1">
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
        </div>
      ) : (
        <div className="w-12.5 h-full min-h-dvh bg-(--darkest) border-l border-(--gray) flex flex-col items-center justify-start p-2 gap-4">
          <button
            onClick={() => setChatOpen(true)}
            className=" p-1 rounded-lg hover:bg-(--darkest-hover)"
          >
            <PanelRightOpen size={20} />
          </button>
          {!componentsLocked ? (
            <div className="flex flex-col bg-(--dim) rounded-lg justify-center p-1 h-max gap-4">
              <button
                className="h-full p-1 rounded-md bg-(--quite-dark) text-(--vibrant) hover:bg-(--quite-dark) w-full"
                onClick={() => {
                  setChatOpen(true);
                }}
              >
                <LayoutGrid size={20} className="mx-auto" />
              </button>
              <button
                className="h-full p-1 rounded-md hover:bg-(--quite-dark) w-full"
                onClick={() => {
                  setActiveTab("messages");
                  setChatOpen(true);
                }}
              >
                <MessageSquare size={20} className="mx-auto" />
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
