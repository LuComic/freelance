"use client";

import { api } from "@/convex/_generated/api";
import { TABS_COOKIE, setCookie } from "@/app/lib/cookies";
import { useOptionalPageDocument } from "@/app/lib/components/project/PageDocumentContext";
import { useQueries, useQuery } from "convex/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { TabItem } from "./TabItem";
import { usePageQueryPreloader } from "../project/usePageQueryPreloader";
import {
  buildRetainedPageQueries,
  buildTabsById,
  closeTabsById,
  getAllTabIds,
  getOtherTabIds,
  getPageTabTarget,
  getTabIdsToLeft,
  getTabIdsToRight,
  openTab,
  scrollTabs,
  updateTabScrollButtons,
} from "./tabHelpers";
import {
  EMPTY_TABS_STATE,
  reconcileTabsWithProjects,
  resolveTabForRoute,
  serializeTabsCookie,
  type StoredTabsState,
  upsertTab,
} from "./tabState";

type TabProps = {
  initialTabsState: StoredTabsState;
};

export const Tab = ({ initialTabsState }: TabProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const preloadPage = usePageQueryPreloader();
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
    () => buildTabsById(resolvedTabs),
    [resolvedTabs],
  );
  const retainedPageQueries = useMemo(
    () =>
      buildRetainedPageQueries({
        recentTabIds: tabsState.recentTabIds,
        tabsById: resolvedTabsById,
      }),
    [resolvedTabsById, tabsState.recentTabIds],
  );

  useQueries(retainedPageQueries);

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

  const closeTabsContext = {
    tabsState,
    activeTabId,
    tabsById: resolvedTabsById,
    canUseFallbackPath: projects === undefined,
    setTabsState,
    setIsClosingLastTab,
    replaceRoute: router.replace,
  };

  const updateScrollButtons = useCallback(() => {
    updateTabScrollButtons({
      tabsContainerRef,
      setCanScrollLeft,
      setCanScrollRight,
    });
  }, []);

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
                  className="relative z-10 flex h-9 w-8 shrink-0 items-center justify-center border-r border-(--gray) text-(--gray-page) hover:bg-(--darkest) hover:text-(--light)"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    scrollTabs(tabsContainerRef.current, "left");
                  }}
                  aria-label="Scroll tabs left"
                >
                  <ChevronLeft size={18} />
                </button>
              ) : null}
              <div
                ref={tabsContainerRef}
                className="flex min-w-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-y-none scrollbar-none [&::-webkit-scrollbar]:hidden"
                onScroll={updateScrollButtons}
              >
                {resolvedTabs.map((tab) => (
                  <TabItem
                    key={tab.tabId}
                    title={tab.title}
                    contextLabel={tab.contextLabel}
                    isActive={tab.tabId === activeTabId}
                    onSelect={() =>
                      openTab({
                        tab,
                        activeTabId,
                        projectsLoaded: projects !== undefined,
                        tabsById: resolvedTabsById,
                        canUseFallbackPath: projects === undefined,
                        preloadPage,
                        setTabsState,
                        pushRoute: router.push,
                      })
                    }
                    onPreload={() => {
                      const target = getPageTabTarget(tab);

                      if (target) {
                        preloadPage(target.projectId, target.pageId);
                      }
                    }}
                    onClose={() =>
                      closeTabsById({
                        ...closeTabsContext,
                        tabIds: [tab.tabId],
                      })
                    }
                    onCloseAll={() =>
                      closeTabsById({
                        ...closeTabsContext,
                        tabIds: getAllTabIds(resolvedTabs),
                      })
                    }
                    onCloseOthers={() =>
                      closeTabsById({
                        ...closeTabsContext,
                        tabIds: getOtherTabIds(resolvedTabs, tab.tabId),
                        preferredTabId: tab.tabId,
                      })
                    }
                    onCloseRight={() =>
                      closeTabsById({
                        ...closeTabsContext,
                        tabIds: getTabIdsToRight(resolvedTabs, tab.tabId),
                        preferredTabId: tab.tabId,
                      })
                    }
                    onCloseLeft={() =>
                      closeTabsById({
                        ...closeTabsContext,
                        tabIds: getTabIdsToLeft(resolvedTabs, tab.tabId),
                        preferredTabId: tab.tabId,
                      })
                    }
                  />
                ))}
              </div>
              {canScrollRight ? (
                <button
                  type="button"
                  className="relative z-10 flex h-9 w-8 shrink-0 items-center justify-center border-l border-(--gray) text-(--gray-page) hover:bg-(--darkest) hover:text-(--light)"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    scrollTabs(tabsContainerRef.current, "right");
                  }}
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
