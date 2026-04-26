"use client";

import { api } from "@/convex/_generated/api";
import { TABS_COOKIE, setCookie } from "@/app/lib/cookies";
import { useOptionalPageDocument } from "@/app/lib/components/project/PageDocumentContext";
import { useQuery } from "convex/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { TabItem } from "./TabItem";
import {
  EMPTY_TABS_STATE,
  getNextRecentTabId,
  reconcileTabsWithProjects,
  removeTabById,
  resolveTabForRoute,
  resolveTabPath,
  serializeTabsCookie,
  type StoredTab,
  type StoredTabsState,
  upsertTab,
} from "./tabState";

type TabProps = {
  initialTabsState: StoredTabsState;
};

export const Tab = ({ initialTabsState }: TabProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const pageDocument = useOptionalPageDocument();
  const projects = useQuery(api.projects.queries.listCurrentUserProjects);
  const [tabsState, setTabsState] = useState<StoredTabsState>(
    initialTabsState ?? EMPTY_TABS_STATE,
  );
  const [isClosingLastTab, setIsClosingLastTab] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const activeTab = useMemo(
    () =>
      resolveTabForRoute({
        pathname,
        projects: projects ?? undefined,
        activePage: pageDocument?.activePage ?? null,
      }),
    [pageDocument?.activePage, pathname, projects],
  );
  const activeTabId = activeTab?.tabId ?? null;
  const resolvedTabs = tabsState.tabs;
  const resolvedTabsById = useMemo(
    () =>
      new Map<string, StoredTab>(
        resolvedTabs.map((tab) => [tab.tabId, tab] as const),
      ),
    [resolvedTabs],
  );

  useEffect(() => {
    if (!activeTab) {
      return;
    }

    queueMicrotask(() => {
      setTabsState((prev) => upsertTab(prev, activeTab));
    });
  }, [activeTab]);

  useEffect(() => {
    if (projects === undefined) {
      return;
    }

    queueMicrotask(() => {
      setTabsState((prev) => {
        const next = reconcileTabsWithProjects(prev, projects);

        return serializeTabsCookie(next) === serializeTabsCookie(prev)
          ? prev
          : next;
      });
    });
  }, [projects]);

  useEffect(() => {
    setCookie(TABS_COOKIE, serializeTabsCookie(tabsState));
  }, [tabsState]);

  useEffect(() => {
    if (!isClosingLastTab || pathname !== "/projects") {
      return;
    }

    queueMicrotask(() => {
      setTabsState(EMPTY_TABS_STATE);
      setIsClosingLastTab(false);
    });
  }, [isClosingLastTab, pathname]);

  const openTab = (tab: StoredTab) => {
    if (tab.tabId === activeTabId) {
      return;
    }

    const resolvedTab = resolvedTabsById.get(tab.tabId);

    if (projects !== undefined && !resolvedTab) {
      setTabsState((prev) => removeTabById(prev, tab.tabId));
      return;
    }

    router.push((resolvedTab ?? { path: resolveTabPath(tab) }).path);
  };

  const openNextAvailableTab = (
    nextState: StoredTabsState,
    preferredTabId?: string,
  ) => {
    const preferredTab = preferredTabId
      ? nextState.tabs.find((tab) => tab.tabId === preferredTabId)
      : null;

    if (preferredTab) {
      const resolvedTab = resolvedTabsById.get(preferredTab.tabId);
      const nextPath =
        resolvedTab?.path ??
        (projects === undefined ? resolveTabPath(preferredTab) : null);

      if (nextPath) {
        setTabsState(nextState);
        router.replace(nextPath);
        return;
      }
    }

    let nextRecentTabId = getNextRecentTabId(nextState);

    while (nextRecentTabId) {
      const nextTab = nextState.tabs.find(
        (tab) => tab.tabId === nextRecentTabId,
      );

      if (!nextTab) {
        nextState = removeTabById(nextState, nextRecentTabId);
        nextRecentTabId = getNextRecentTabId(nextState);
        continue;
      }

      const resolvedTab = resolvedTabsById.get(nextRecentTabId);
      const nextPath =
        resolvedTab?.path ??
        (projects === undefined ? resolveTabPath(nextTab) : null);

      if (nextPath) {
        setTabsState(nextState);
        router.replace(nextPath);
        return;
      }

      nextState = removeTabById(nextState, nextRecentTabId);
      nextRecentTabId = getNextRecentTabId(nextState);
    }

    setTabsState(nextState);
    router.replace("/projects");
  };

  const closeTabsById = (tabIds: string[], preferredTabId?: string) => {
    const tabIdsToClose = new Set(tabIds);

    if (tabIdsToClose.size === 0) {
      return;
    }

    const isActiveTabClosing =
      activeTabId !== null && tabIdsToClose.has(activeTabId);
    let nextState = tabsState;

    for (const tabId of tabIdsToClose) {
      nextState = removeTabById(nextState, tabId);
    }

    if (nextState.tabs.length === 0) {
      setIsClosingLastTab(true);
      setCookie(TABS_COOKIE, serializeTabsCookie(nextState));
      router.replace("/projects");
      return;
    }

    if (!isActiveTabClosing) {
      setTabsState(nextState);
      return;
    }

    openNextAvailableTab(nextState, preferredTabId);
  };

  const closeTab = (tabId: string) => {
    closeTabsById([tabId]);
  };

  const closeAllTabs = () => {
    closeTabsById(resolvedTabs.map((tab) => tab.tabId));
  };

  const closeOtherTabs = (tabId: string) => {
    closeTabsById(
      resolvedTabs.filter((tab) => tab.tabId !== tabId).map((tab) => tab.tabId),
      tabId,
    );
  };

  const closeTabsToRight = (tabId: string) => {
    const tabIndex = resolvedTabs.findIndex((tab) => tab.tabId === tabId);

    if (tabIndex === -1 || tabIndex === resolvedTabs.length - 1) {
      return;
    }

    closeTabsById([resolvedTabs[tabIndex + 1].tabId]);
  };

  const closeTabsToLeft = (tabId: string) => {
    const tabIndex = resolvedTabs.findIndex((tab) => tab.tabId === tabId);

    if (tabIndex === -1 || tabIndex === 0) {
      return;
    }

    closeTabsById([resolvedTabs[tabIndex - 1].tabId]);
  };

  const updateScrollButtons = useCallback(() => {
    const tabsContainer = tabsContainerRef.current;

    if (!tabsContainer) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    setCanScrollLeft(tabsContainer.scrollLeft > 0);
    setCanScrollRight(
      tabsContainer.scrollLeft + tabsContainer.clientWidth <
        tabsContainer.scrollWidth - 1,
    );
  }, []);

  const scrollTabs = (direction: "left" | "right") => {
    const tabsContainer = tabsContainerRef.current;

    if (!tabsContainer) {
      return;
    }

    const tabWidth =
      tabsContainer.firstElementChild?.getBoundingClientRect().width ??
      tabsContainer.clientWidth;

    tabsContainer.scrollBy({
      left: direction === "left" ? -tabWidth : tabWidth,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const tabsContainer = tabsContainerRef.current;
    const animationFrame = window.requestAnimationFrame(updateScrollButtons);

    if (!tabsContainer) {
      return () => {
        window.cancelAnimationFrame(animationFrame);
      };
    }

    const resizeObserver = new ResizeObserver(updateScrollButtons);

    resizeObserver.observe(tabsContainer);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [resolvedTabs.length, updateScrollButtons]);

  // Check if its desktop. Avoid using hidden for optimization

  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <>
      {isDesktop ? (
        <div className="bg-(--dim) max-w-full w-full items-center justify-start border-b border-(--gray) flex overscroll-y-none overflow-y-hidden">
          {resolvedTabs.length > 0 ? (
            <>
              {canScrollLeft ? (
                <button
                  type="button"
                  className="flex h-9 w-8 shrink-0 items-center justify-center border-r border-(--gray) text-(--gray-page) hover:bg-(--darkest) hover:text-(--light)"
                  onClick={() => scrollTabs("left")}
                  aria-label="Scroll tabs left"
                >
                  <ChevronLeft size={18} />
                </button>
              ) : null}
              <div
                ref={tabsContainerRef}
                className="flex min-w-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-y-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                onScroll={updateScrollButtons}
              >
                {resolvedTabs.map((tab) => (
                  <TabItem
                    key={tab.tabId}
                    title={tab.title}
                    contextLabel={tab.contextLabel}
                    isActive={tab.tabId === activeTabId}
                    onSelect={() => openTab(tab)}
                    onClose={() => closeTab(tab.tabId)}
                    onCloseAll={closeAllTabs}
                    onCloseOthers={() => closeOtherTabs(tab.tabId)}
                    onCloseRight={() => closeTabsToRight(tab.tabId)}
                    onCloseLeft={() => closeTabsToLeft(tab.tabId)}
                  />
                ))}
              </div>
              {canScrollRight ? (
                <button
                  type="button"
                  className="flex h-9 w-8 shrink-0 items-center justify-center border-l border-(--gray) text-(--gray-page) hover:bg-(--darkest) hover:text-(--light)"
                  onClick={() => scrollTabs("right")}
                  aria-label="Scroll tabs right"
                >
                  <ChevronRight size={18} />
                </button>
              ) : null}
            </>
          ) : (
            <span className="text-(--gray-page) h-9 flex items-center justify-center w-full">
              Communication between freelancers and clients
            </span>
          )}
        </div>
      ) : null}
    </>
  );
};
