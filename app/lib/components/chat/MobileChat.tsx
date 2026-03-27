"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { PanelRightClose, LayoutGrid, LibraryBig } from "lucide-react";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { ComponentLib, type ComponentTag } from "./ComponentLib";

export const MobileChat = () => {
  const {
    isEditing,
    modeLock,
    requestComponentInsert,
    componentLibraryOpenRequestNonce,
  } = useEditMode();
  const [chatOpen, setChatOpen] = useState(false);
  const [componentFilter, setComponentFilter] = useState<"" | ComponentTag>("");
  const handledComponentLibraryNonceRef = useRef(0);
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
      setChatOpen(true);
    });
  }, [componentLibraryOpenRequestNonce, componentsLocked]);

  return (
    <div className="block md:hidden">
      {chatOpen ? (
        <nav className="w-90.75 h-dvh max-h-dvh bg-(--darkest) border-l border-(--gray) flex flex-col items-start justify-start p-2 gap-4 fixed z-30 top-0 right-0 overflow-hidden">
          <div className="flex items-center justify-start gap-2 w-full">
            <button
              onClick={() => setChatOpen(false)}
              className=" p-1 rounded-lg hover:bg-(--darkest-hover)"
            >
              <PanelRightClose size={22} />
            </button>
            <span className="text-(--gray) text-xl">Components</span>
          </div>

          <div className="w-full flex-1 min-h-0 overflow-y-auto">
            {!componentsLocked ? (
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
