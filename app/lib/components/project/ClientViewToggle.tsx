"use client";

import { usePathname } from "next/navigation";
import { useEditMode } from "./EditModeContext";
import { useOptionalPageDocument } from "./PageDocumentContext";

export const ClientViewToggle = () => {
  const { isLive, modeLock, setIsEditing } = useEditMode();
  const pageDocument = useOptionalPageDocument();
  const pathname = usePathname();
  const isHidden =
    pathname.includes("settings") ||
    pathname.includes("analytics") ||
    pathname.includes("terms") ||
    pathname.includes("privacy") ||
    pathname.includes("cookies") ||
    pathname === "/projects" ||
    !pageDocument?.isActivePage ||
    pageDocument?.viewerRole === "client" ||
    modeLock === "live";

  if (!isLive || isHidden) {
    return null;
  }

  return (
    <div className="m-1.5 rounded-sm h-7.5 bg-(--gray) self-stretch hidden md:flex items-center justify-center gap-2">
      <span className="font-medium">Client&apos;s view</span>
      <span>|</span>
      <button
        className="underline underline-offset-2 hover:opacity-80"
        onClick={() => {
          setIsEditing(true);
        }}
      >
        Back to edit
      </button>
    </div>
  );
};
