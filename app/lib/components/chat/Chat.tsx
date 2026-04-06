"use client";

import { useEffect, useRef } from "react";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { useOptionalPageDocument } from "@/app/lib/components/project/PageDocumentContext";
import { useMediaQuery } from "@/app/lib/hooks/useMediaQuery";
import { DesktopChat } from "./DesktopChat";
import { MobileChat } from "./MobileChat";

type ChatProps = {
  initialChatOpen?: boolean;
};

export const Chat = ({ initialChatOpen }: ChatProps) => {
  const { clearSelectedConfigComponent } = useEditMode();
  const pageDocument = useOptionalPageDocument();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const activePageId = pageDocument?.activePage?.page.id ?? null;
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
    <DesktopChat initialOpen={initialChatOpen} />
  ) : (
    <MobileChat />
  );
};
