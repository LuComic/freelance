"use client";

import { useEffect, useRef } from "react";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { useOptionalPageDocument } from "@/app/lib/components/project/PageDocumentContext";
import { useMediaQuery } from "@/app/lib/hooks/useMediaQuery";
import { usePathname } from "next/navigation";
import { DesktopChat } from "./DesktopChat";
import { MobileChat } from "./MobileChat";

type ChatProps = {
  initialChatOpen?: boolean;
  initialChatWidth?: number;
};

export const Chat = ({ initialChatOpen, initialChatWidth }: ChatProps) => {
  const { clearSelectedConfigComponent } = useEditMode();
  const pageDocument = useOptionalPageDocument();
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const activePageId = pageDocument?.activePage?.page.id ?? null;
  const routeProjectId = pathname.match(/\/projects\/([^/]+)/)?.[1] ?? null;
  const projectId = pageDocument?.activePage?.project.id ?? routeProjectId;
  const previousPageIdRef = useRef<string | null>(activePageId);

  useEffect(() => {
    if (previousPageIdRef.current === activePageId) {
      return;
    }

    previousPageIdRef.current = activePageId;
    clearSelectedConfigComponent();
  }, [activePageId, clearSelectedConfigComponent]);

  if (isDesktop === null) {
    return null;
  }

  return isDesktop ? (
    <DesktopChat
      initialOpen={initialChatOpen}
      initialWidth={initialChatWidth}
      projectId={projectId}
    />
  ) : (
    <MobileChat projectId={projectId} />
  );
};
