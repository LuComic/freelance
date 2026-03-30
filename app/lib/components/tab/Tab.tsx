"use client";

import { api } from "@/convex/_generated/api";
import { TABS_COOKIE, setCookie } from "@/app/lib/cookies";
import { useOptionalPageDocument } from "@/app/lib/components/project/PageDocumentContext";
import { useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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

  const closeTab = (tabId: string) => {
    let nextState = removeTabById(tabsState, tabId);

    if (nextState.tabs.length === 0) {
      setIsClosingLastTab(true);
      setCookie(TABS_COOKIE, serializeTabsCookie(nextState));
      router.replace("/projects");
      return;
    }

    if (tabId !== activeTabId) {
      setTabsState(nextState);
      return;
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

  return (
    <div className="hidden bg-(--dim) max-w-full w-full items-center justify-start overflow-x-auto border-b border-(--gray) md:flex overscroll-y-none invis-scroll">
      {resolvedTabs.length > 0 ? (
        <>
          {resolvedTabs.map((tab) => (
            <TabItem
              key={tab.tabId}
              title={tab.title}
              contextLabel={tab.contextLabel}
              isActive={tab.tabId === activeTabId}
              onSelect={() => openTab(tab)}
              onClose={() => closeTab(tab.tabId)}
            />
          ))}
        </>
      ) : (
        <span className="text-(--gray-page) h-9 flex items-center justify-center w-full">
          Communication between freelancers and clients
        </span>
      )}
    </div>
  );
};
