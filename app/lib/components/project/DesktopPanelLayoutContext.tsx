"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CHAT_WIDTH_COOKIE,
  SIDEBAR_WIDTH_COOKIE,
  setCookie,
} from "@/app/lib/cookies";
import {
  CHAT_MAX_WIDTH,
  CHAT_MIN_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
} from "./desktopPanelSizing";

type DesktopPanelLayoutContextValue = {
  sidebarWidth: number;
  chatWidth: number;
  setSidebarWidth: (width: number) => void;
  setChatWidth: (width: number) => void;
  setSidebarOpen: (open: boolean) => void;
  setChatOpen: (open: boolean) => void;
};

const FALLBACK_SPACING_UNIT_PX = 4;

const DesktopPanelLayoutContext =
  createContext<DesktopPanelLayoutContextValue | null>(null);

function clamp(width: number, minWidth: number, maxWidth: number) {
  return Math.min(Math.max(width, minWidth), maxWidth);
}

function roundToQuarter(width: number) {
  return Math.round(width * 4) / 4;
}

function getSpacingUnitPx() {
  if (typeof window === "undefined") {
    return FALLBACK_SPACING_UNIT_PX;
  }

  const fontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );

  if (!Number.isFinite(fontSize) || fontSize <= 0) {
    return FALLBACK_SPACING_UNIT_PX;
  }

  return fontSize / 4;
}

function normalizeWidths(
  sidebarWidth: number,
  chatWidth: number,
  availableWidth: number,
) {
  const maxSidebarWidth = Math.max(
    SIDEBAR_MIN_WIDTH,
    Math.min(SIDEBAR_MAX_WIDTH, availableWidth - CHAT_MIN_WIDTH),
  );
  const maxChatWidth = Math.max(
    CHAT_MIN_WIDTH,
    Math.min(CHAT_MAX_WIDTH, availableWidth - SIDEBAR_MIN_WIDTH),
  );

  let nextSidebarWidth = clamp(
    sidebarWidth,
    SIDEBAR_MIN_WIDTH,
    maxSidebarWidth,
  );
  let nextChatWidth = clamp(chatWidth, CHAT_MIN_WIDTH, maxChatWidth);
  let overflow = nextSidebarWidth + nextChatWidth - availableWidth;

  if (overflow <= 0) {
    return { sidebarWidth: nextSidebarWidth, chatWidth: nextChatWidth };
  }

  const sidebarSlack = nextSidebarWidth - SIDEBAR_MIN_WIDTH;
  const chatSlack = nextChatWidth - CHAT_MIN_WIDTH;

  if (sidebarSlack >= chatSlack) {
    const sidebarReduction = Math.min(overflow, sidebarSlack);
    nextSidebarWidth -= sidebarReduction;
    overflow -= sidebarReduction;

    if (overflow > 0) {
      nextChatWidth -= Math.min(overflow, chatSlack);
    }
  } else {
    const chatReduction = Math.min(overflow, chatSlack);
    nextChatWidth -= chatReduction;
    overflow -= chatReduction;

    if (overflow > 0) {
      nextSidebarWidth -= Math.min(overflow, sidebarSlack);
    }
  }

  return {
    sidebarWidth: roundToQuarter(nextSidebarWidth),
    chatWidth: roundToQuarter(nextChatWidth),
  };
}

export function DesktopPanelLayoutProvider({
  children,
  initialSidebarWidth,
  initialChatWidth,
}: {
  children: ReactNode;
  initialSidebarWidth: number;
  initialChatWidth: number;
}) {
  const [sidebarWidth, setSidebarWidthState] = useState(() =>
    clamp(initialSidebarWidth, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH),
  );
  const [chatWidth, setChatWidthState] = useState(() =>
    clamp(initialChatWidth, CHAT_MIN_WIDTH, CHAT_MAX_WIDTH),
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);

  const normalizePanelWidths = useCallback(
    (
      nextSidebarWidth: number,
      nextChatWidth: number,
      nextViewportWidth: number,
    ) => normalizeWidths(nextSidebarWidth, nextChatWidth, nextViewportWidth),
    [],
  );

  useEffect(() => {
    const updateViewportWidth = () => {
      const nextViewportWidth = window.innerWidth / getSpacingUnitPx();
      setViewportWidth(nextViewportWidth);

      if (!sidebarOpen || !chatOpen) {
        return;
      }

      const normalizedWidths = normalizePanelWidths(
        sidebarWidth,
        chatWidth,
        nextViewportWidth,
      );

      if (normalizedWidths.sidebarWidth !== sidebarWidth) {
        setSidebarWidthState(normalizedWidths.sidebarWidth);
      }

      if (normalizedWidths.chatWidth !== chatWidth) {
        setChatWidthState(normalizedWidths.chatWidth);
      }
    };

    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);

    return () => window.removeEventListener("resize", updateViewportWidth);
  }, [chatOpen, chatWidth, normalizePanelWidths, sidebarOpen, sidebarWidth]);

  const applyWidthChange = useCallback(
    (panel: "sidebar" | "chat", requestedWidth: number) => {
      if (!sidebarOpen || !chatOpen || viewportWidth == null) {
        if (panel === "sidebar") {
          const nextSidebarWidth = clamp(
            requestedWidth,
            SIDEBAR_MIN_WIDTH,
            SIDEBAR_MAX_WIDTH,
          );
          setSidebarWidthState(nextSidebarWidth);
          return;
        }

        const nextChatWidth = clamp(
          requestedWidth,
          CHAT_MIN_WIDTH,
          CHAT_MAX_WIDTH,
        );
        setChatWidthState(nextChatWidth);
        return;
      }

      if (panel === "sidebar") {
        const maxSidebarWidth = Math.max(
          SIDEBAR_MIN_WIDTH,
          Math.min(SIDEBAR_MAX_WIDTH, viewportWidth - CHAT_MIN_WIDTH),
        );
        const nextSidebarWidth = clamp(
          requestedWidth,
          SIDEBAR_MIN_WIDTH,
          maxSidebarWidth,
        );
        const nextChatWidth = Math.max(
          CHAT_MIN_WIDTH,
          Math.min(chatWidth, viewportWidth - nextSidebarWidth),
        );

        setSidebarWidthState(roundToQuarter(nextSidebarWidth));
        setChatWidthState(roundToQuarter(nextChatWidth));
        return;
      }

      const maxChatWidth = Math.max(
        CHAT_MIN_WIDTH,
        Math.min(CHAT_MAX_WIDTH, viewportWidth - SIDEBAR_MIN_WIDTH),
      );
      const nextChatWidth = clamp(requestedWidth, CHAT_MIN_WIDTH, maxChatWidth);
      const nextSidebarWidth = Math.max(
        SIDEBAR_MIN_WIDTH,
        Math.min(sidebarWidth, viewportWidth - nextChatWidth),
      );

      setSidebarWidthState(roundToQuarter(nextSidebarWidth));
      setChatWidthState(roundToQuarter(nextChatWidth));
    },
    [chatOpen, chatWidth, sidebarOpen, sidebarWidth, viewportWidth],
  );

  useEffect(() => {
    setCookie(SIDEBAR_WIDTH_COOKIE, String(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    setCookie(CHAT_WIDTH_COOKIE, String(chatWidth));
  }, [chatWidth]);

  const updateSidebarOpen = useCallback(
    (open: boolean) => {
      setSidebarOpen(open);

      if (!open || !chatOpen || viewportWidth == null) {
        return;
      }

      const normalizedWidths = normalizePanelWidths(
        sidebarWidth,
        chatWidth,
        viewportWidth,
      );

      setSidebarWidthState(normalizedWidths.sidebarWidth);
      setChatWidthState(normalizedWidths.chatWidth);
    },
    [chatOpen, chatWidth, normalizePanelWidths, sidebarWidth, viewportWidth],
  );

  const updateChatOpen = useCallback(
    (open: boolean) => {
      setChatOpen(open);

      if (!open || !sidebarOpen || viewportWidth == null) {
        return;
      }

      const normalizedWidths = normalizePanelWidths(
        sidebarWidth,
        chatWidth,
        viewportWidth,
      );

      setSidebarWidthState(normalizedWidths.sidebarWidth);
      setChatWidthState(normalizedWidths.chatWidth);
    },
    [chatWidth, normalizePanelWidths, sidebarOpen, sidebarWidth, viewportWidth],
  );

  const value = useMemo<DesktopPanelLayoutContextValue>(
    () => ({
      sidebarWidth,
      chatWidth,
      setSidebarWidth: (width) => applyWidthChange("sidebar", width),
      setChatWidth: (width) => applyWidthChange("chat", width),
      setSidebarOpen: updateSidebarOpen,
      setChatOpen: updateChatOpen,
    }),
    [
      applyWidthChange,
      chatWidth,
      sidebarWidth,
      updateChatOpen,
      updateSidebarOpen,
    ],
  );

  return (
    <DesktopPanelLayoutContext.Provider value={value}>
      {children}
    </DesktopPanelLayoutContext.Provider>
  );
}

export function useDesktopPanelLayout() {
  const context = useContext(DesktopPanelLayoutContext);

  if (!context) {
    throw new Error(
      "useDesktopPanelLayout must be used within DesktopPanelLayoutProvider.",
    );
  }

  return context;
}
