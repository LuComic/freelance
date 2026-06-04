import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { TABS_COOKIE, setCookie } from "@/app/lib/cookies";
import type { Dispatch, RefObject, SetStateAction } from "react";
import {
  getNextRecentTabId,
  removeTabById,
  serializeTabsCookie,
  resolveTabPath,
  type StoredTab,
  type StoredTabsState,
} from "./tabState";

const RECENT_PAGE_QUERY_RETAIN_COUNT = 3;

export type PageTabTarget = {
  projectId: string;
  pageId: string;
};

export type TabCloseResult =
  | {
      type: "noop";
    }
  | {
      type: "empty";
      nextState: StoredTabsState;
    }
  | {
      type: "update";
      nextState: StoredTabsState;
    }
  | {
      type: "navigate";
      nextState: StoredTabsState;
      nextPath: string;
    };

type CloseTabsByIdArgs = {
  tabsState: StoredTabsState;
  tabIds: string[];
  activeTabId: string | null;
  preferredTabId?: string;
  tabsById: Map<string, StoredTab>;
  canUseFallbackPath: boolean;
  setTabsState: Dispatch<SetStateAction<StoredTabsState>>;
  setIsClosingLastTab: Dispatch<SetStateAction<boolean>>;
  replaceRoute: (path: string) => void;
};

type OpenTabArgs = {
  tab: StoredTab;
  activeTabId: string | null;
  projectsLoaded: boolean;
  tabsById: Map<string, StoredTab>;
  canUseFallbackPath: boolean;
  preloadPage: (projectId: string, pageId: string) => void;
  setTabsState: Dispatch<SetStateAction<StoredTabsState>>;
  pushRoute: (path: string) => void;
};

type TabScrollStateArgs = {
  tabsContainerRef: RefObject<HTMLDivElement | null>;
  setCanScrollLeft: Dispatch<SetStateAction<boolean>>;
  setCanScrollRight: Dispatch<SetStateAction<boolean>>;
};

export function buildTabsById(tabs: StoredTab[]) {
  return new Map<string, StoredTab>(
    tabs.map((tab) => [tab.tabId, tab] as const),
  );
}

export function getPageTabTarget(tab: StoredTab): PageTabTarget | null {
  if (tab.kind !== "projectPage" || !tab.projectId || !tab.pageId) {
    return null;
  }

  return {
    projectId: tab.projectId,
    pageId: tab.pageId,
  };
}

export function buildRetainedPageQueries({
  recentTabIds,
  tabsById,
}: {
  recentTabIds: string[];
  tabsById: Map<string, StoredTab>;
}) {
  const queryEntries: Array<
    [
      string,
      {
        query: typeof api.pages.queries.getPageEditor;
        args: {
          projectId: Id<"projects">;
          pageId: Id<"pages">;
        };
      },
    ]
  > = [];
  const retainedPageKeys = new Set<string>();

  for (const tabId of [...recentTabIds].reverse()) {
    const tab = tabsById.get(tabId);
    const target = tab ? getPageTabTarget(tab) : null;

    if (!target) {
      continue;
    }

    const pageKey = `${target.projectId}:${target.pageId}`;

    if (retainedPageKeys.has(pageKey)) {
      continue;
    }

    retainedPageKeys.add(pageKey);
    queryEntries.push([
      pageKey,
      {
        query: api.pages.queries.getPageEditor,
        args: {
          projectId: target.projectId as Id<"projects">,
          pageId: target.pageId as Id<"pages">,
        },
      },
    ]);

    if (queryEntries.length >= RECENT_PAGE_QUERY_RETAIN_COUNT) {
      break;
    }
  }

  return Object.fromEntries(queryEntries);
}

export function resolveOpenTabPath({
  tab,
  tabsById,
  canUseFallbackPath,
}: {
  tab: StoredTab;
  tabsById: Map<string, StoredTab>;
  canUseFallbackPath: boolean;
}) {
  const resolvedTab = tabsById.get(tab.tabId);

  return resolvedTab?.path ?? (canUseFallbackPath ? resolveTabPath(tab) : null);
}

export function getTabIdsToRight(tabs: StoredTab[], tabId: string) {
  const tabIndex = tabs.findIndex((tab) => tab.tabId === tabId);

  if (tabIndex === -1 || tabIndex === tabs.length - 1) {
    return [];
  }

  return tabs.slice(tabIndex + 1).map((tab) => tab.tabId);
}

export function getTabIdsToLeft(tabs: StoredTab[], tabId: string) {
  const tabIndex = tabs.findIndex((tab) => tab.tabId === tabId);

  if (tabIndex === -1 || tabIndex === 0) {
    return [];
  }

  return tabs.slice(0, tabIndex).map((tab) => tab.tabId);
}

export function getOtherTabIds(tabs: StoredTab[], tabId: string) {
  return tabs.filter((tab) => tab.tabId !== tabId).map((tab) => tab.tabId);
}

export function getAllTabIds(tabs: StoredTab[]) {
  return tabs.map((tab) => tab.tabId);
}

export function resolveTabClose({
  tabsState,
  tabIds,
  activeTabId,
  preferredTabId,
  tabsById,
  canUseFallbackPath,
}: {
  tabsState: StoredTabsState;
  tabIds: string[];
  activeTabId: string | null;
  preferredTabId?: string;
  tabsById: Map<string, StoredTab>;
  canUseFallbackPath: boolean;
}): TabCloseResult {
  const tabIdsToClose = new Set(tabIds);

  if (tabIdsToClose.size === 0) {
    return { type: "noop" };
  }

  const isActiveTabClosing =
    activeTabId !== null && tabIdsToClose.has(activeTabId);
  let nextState = tabsState;

  for (const tabId of tabIdsToClose) {
    nextState = removeTabById(nextState, tabId);
  }

  if (nextState.tabs.length === 0) {
    return {
      type: "empty",
      nextState,
    };
  }

  if (!isActiveTabClosing) {
    return {
      type: "update",
      nextState,
    };
  }

  const preferredTab = preferredTabId
    ? nextState.tabs.find((tab) => tab.tabId === preferredTabId)
    : null;

  if (preferredTab) {
    const nextPath = resolveOpenTabPath({
      tab: preferredTab,
      tabsById,
      canUseFallbackPath,
    });

    if (nextPath) {
      return {
        type: "navigate",
        nextState,
        nextPath,
      };
    }
  }

  let nextRecentTabId = getNextRecentTabId(nextState);

  while (nextRecentTabId) {
    const nextTab = nextState.tabs.find((tab) => tab.tabId === nextRecentTabId);

    if (!nextTab) {
      nextState = removeTabById(nextState, nextRecentTabId);
      nextRecentTabId = getNextRecentTabId(nextState);
      continue;
    }

    const nextPath = resolveOpenTabPath({
      tab: nextTab,
      tabsById,
      canUseFallbackPath,
    });

    if (nextPath) {
      return {
        type: "navigate",
        nextState,
        nextPath,
      };
    }

    nextState = removeTabById(nextState, nextRecentTabId);
    nextRecentTabId = getNextRecentTabId(nextState);
  }

  return {
    type: "navigate",
    nextState,
    nextPath: "/projects",
  };
}

export function closeTabsById({
  tabsState,
  tabIds,
  activeTabId,
  preferredTabId,
  tabsById,
  canUseFallbackPath,
  setTabsState,
  setIsClosingLastTab,
  replaceRoute,
}: CloseTabsByIdArgs) {
  const result = resolveTabClose({
    tabsState,
    tabIds,
    activeTabId,
    preferredTabId,
    tabsById,
    canUseFallbackPath,
  });

  if (result.type === "noop") {
    return;
  }

  if (result.type === "empty") {
    setIsClosingLastTab(true);
    setCookie(TABS_COOKIE, serializeTabsCookie(result.nextState));
    replaceRoute("/projects");
    return;
  }

  if (result.type === "update") {
    setTabsState(result.nextState);
    return;
  }

  setTabsState(result.nextState);
  replaceRoute(result.nextPath);
}

export function openTab({
  tab,
  activeTabId,
  projectsLoaded,
  tabsById,
  canUseFallbackPath,
  preloadPage,
  setTabsState,
  pushRoute,
}: OpenTabArgs) {
  if (tab.tabId === activeTabId) {
    return;
  }

  const target = getPageTabTarget(tab);

  if (target) {
    preloadPage(target.projectId, target.pageId);
  }

  if (projectsLoaded && !tabsById.has(tab.tabId)) {
    setTabsState((prev) => removeTabById(prev, tab.tabId));
    return;
  }

  const nextPath = resolveOpenTabPath({
    tab,
    tabsById,
    canUseFallbackPath,
  });

  if (nextPath) {
    pushRoute(nextPath);
  }
}

export function updateTabScrollButtons({
  tabsContainerRef,
  setCanScrollLeft,
  setCanScrollRight,
}: TabScrollStateArgs) {
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
}

export function scrollTabs(
  tabsContainer: HTMLDivElement | null,
  direction: "left" | "right",
) {
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
}
