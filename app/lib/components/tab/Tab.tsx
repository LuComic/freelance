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
  getNextRecentTabPageId,
  reconcileTabsWithProjects,
  removeTabByPageId,
  resolveTabPath,
  serializeTabsCookie,
  type StoredTab,
  type StoredTabsState,
  type TabProjectSummary,
  upsertTabFromActivePage,
} from "./tabState";

type ResolvedTab = StoredTab & {
  path: string;
};

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
  const activePageId = pageDocument?.activePage?.page.id ?? null;
  const resolvedTabs = useMemo<ResolvedTab[]>(() => {
    if (projects === undefined) {
      return tabsState.tabs.map((tab) => ({
        ...tab,
        path: resolveTabPath(tab),
      }));
    }

    const projectsById = new Map<string, TabProjectSummary>(
      projects.map((project) => [project.id, project] as const),
    );

    return tabsState.tabs.flatMap((tab) => {
      const project = projectsById.get(tab.projectId);

      if (!project) {
        return [];
      }

      const page = project.pages.find(
        (candidatePage) => candidatePage.id === tab.pageId,
      );

      if (!page) {
        return [];
      }

      return [
        {
          ...tab,
          projectSlug: project.slug,
          projectName: project.name,
          pageSlug: page.slug,
          pageTitle: page.title,
          path: `/projects/${project.slug}/${page.slug}`,
        },
      ];
    });
  }, [projects, tabsState.tabs]);
  const resolvedTabsByPageId = useMemo(
    () =>
      new Map<string, ResolvedTab>(
        resolvedTabs.map((tab) => [tab.pageId, tab] as const),
      ),
    [resolvedTabs],
  );

  useEffect(() => {
    const activePage = pageDocument?.activePage;

    if (!activePage) {
      return;
    }

    queueMicrotask(() => {
      setTabsState((prev) => upsertTabFromActivePage(prev, activePage));
    });
  }, [pageDocument?.activePage]);

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
    if (tab.pageId === activePageId) {
      return;
    }

    const resolvedTab = resolvedTabsByPageId.get(tab.pageId);

    if (projects !== undefined && !resolvedTab) {
      setTabsState((prev) => removeTabByPageId(prev, tab.pageId));
      return;
    }

    router.push((resolvedTab ?? { path: resolveTabPath(tab) }).path);
  };

  const closeTab = (pageId: string) => {
    let nextState = removeTabByPageId(tabsState, pageId);

    if (nextState.tabs.length === 0) {
      setIsClosingLastTab(true);
      setCookie(TABS_COOKIE, serializeTabsCookie(nextState));
      router.replace("/projects");
      return;
    }

    if (pageId !== activePageId) {
      setTabsState(nextState);
      return;
    }

    let nextRecentPageId = getNextRecentTabPageId(nextState);

    while (nextRecentPageId) {
      const nextTab = nextState.tabs.find(
        (tab) => tab.pageId === nextRecentPageId,
      );

      if (!nextTab) {
        nextState = removeTabByPageId(nextState, nextRecentPageId);
        nextRecentPageId = getNextRecentTabPageId(nextState);
        continue;
      }

      const resolvedTab = resolvedTabsByPageId.get(nextRecentPageId);
      const nextPath =
        resolvedTab?.path ??
        (projects === undefined ? resolveTabPath(nextTab) : null);

      if (nextPath) {
        setTabsState(nextState);
        router.replace(nextPath);
        return;
      }

      nextState = removeTabByPageId(nextState, nextRecentPageId);
      nextRecentPageId = getNextRecentTabPageId(nextState);
    }

    setTabsState(nextState);
    router.replace("/projects");
  };

  return (
    <div className="hidden bg-(--darkest) max-w-full w-full items-center justify-start overflow-x-auto border-b border-(--gray) md:flex">
      {resolvedTabs.length > 0 ? (
        <>
          {resolvedTabs.map((tab) => (
            <TabItem
              key={tab.pageId}
              pageTitle={tab.pageTitle}
              projectName={tab.projectName}
              isActive={tab.pageId === activePageId}
              onSelect={() => openTab(tab)}
              onClose={() => closeTab(tab.pageId)}
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
