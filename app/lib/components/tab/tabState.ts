export type StoredTab = {
  pageId: string;
  projectId: string;
  pageSlug: string;
  projectSlug: string;
  pageTitle: string;
  projectName: string;
};

export type StoredTabsState = {
  tabs: StoredTab[];
  recentPageIds: string[];
};

export type TabProjectSummary = {
  id: string;
  slug: string;
  name: string;
  pages: Array<{
    id: string;
    slug: string;
    title: string;
  }>;
};

type ActivePageTabInput = {
  project: {
    id: string;
    slug: string;
    name: string;
  };
  page: {
    id: string;
    slug: string;
    title: string;
  };
};

const MAX_STORED_TABS = 20;

export const EMPTY_TABS_STATE: StoredTabsState = {
  tabs: [],
  recentPageIds: [],
};

function isStoredTab(value: unknown): value is StoredTab {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const tab = value as Partial<StoredTab>;
  return (
    typeof tab.pageId === "string" &&
    typeof tab.projectId === "string" &&
    typeof tab.pageSlug === "string" &&
    typeof tab.projectSlug === "string" &&
    typeof tab.pageTitle === "string" &&
    typeof tab.projectName === "string"
  );
}

function parseRawTabsCookie(value?: string | null) {
  if (!value) {
    return null;
  }

  const candidates = [value];

  try {
    const decodedValue = decodeURIComponent(value);
    if (decodedValue !== value) {
      candidates.push(decodedValue);
    }
  } catch {
    // Ignore malformed URI sequences and fall back to the raw cookie value.
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as unknown;
    } catch {
      continue;
    }
  }

  return null;
}

export function dedupeAndSanitizeTabsState(
  state: StoredTabsState,
): StoredTabsState {
  const seenTabIds = new Set<string>();
  const nextTabs: StoredTab[] = [];

  for (const tab of state.tabs) {
    if (!isStoredTab(tab) || seenTabIds.has(tab.pageId)) {
      continue;
    }

    seenTabIds.add(tab.pageId);
    nextTabs.push(tab);
  }

  const nextRecentPageIds: string[] = [];
  const seenRecentIds = new Set<string>();

  for (const pageId of state.recentPageIds) {
    if (
      typeof pageId !== "string" ||
      seenRecentIds.has(pageId) ||
      !seenTabIds.has(pageId)
    ) {
      continue;
    }

    seenRecentIds.add(pageId);
    nextRecentPageIds.push(pageId);
  }

  while (nextTabs.length > MAX_STORED_TABS) {
    const removedTab = nextTabs.shift();

    if (!removedTab) {
      break;
    }
  }

  const remainingPageIds = new Set(nextTabs.map((tab) => tab.pageId));

  return {
    tabs: nextTabs,
    recentPageIds: nextRecentPageIds.filter((pageId) =>
      remainingPageIds.has(pageId),
    ),
  };
}

export function parseTabsCookie(value?: string | null): StoredTabsState {
  const parsedValue = parseRawTabsCookie(value);

  if (typeof parsedValue !== "object" || parsedValue === null) {
    return EMPTY_TABS_STATE;
  }

  const candidateState = parsedValue as Partial<StoredTabsState>;

  return dedupeAndSanitizeTabsState({
    tabs: Array.isArray(candidateState.tabs) ? candidateState.tabs : [],
    recentPageIds: Array.isArray(candidateState.recentPageIds)
      ? candidateState.recentPageIds.filter(
          (pageId): pageId is string => typeof pageId === "string",
        )
      : [],
  });
}

export function serializeTabsCookie(state: StoredTabsState) {
  return JSON.stringify(dedupeAndSanitizeTabsState(state));
}

export function resolveTabPath(tab: StoredTab) {
  return `/projects/${tab.projectSlug}/${tab.pageSlug}`;
}

export function upsertTabFromActivePage(
  state: StoredTabsState,
  activePage: ActivePageTabInput,
): StoredTabsState {
  const nextTab: StoredTab = {
    pageId: activePage.page.id,
    projectId: activePage.project.id,
    pageSlug: activePage.page.slug,
    projectSlug: activePage.project.slug,
    pageTitle: activePage.page.title,
    projectName: activePage.project.name,
  };
  const existingTabIndex = state.tabs.findIndex(
    (tab) => tab.pageId === nextTab.pageId,
  );
  const nextTabs =
    existingTabIndex === -1
      ? [...state.tabs, nextTab]
      : state.tabs.map((tab, index) => (index === existingTabIndex ? nextTab : tab));

  return dedupeAndSanitizeTabsState({
    tabs: nextTabs,
    recentPageIds: [
      ...state.recentPageIds.filter((pageId) => pageId !== nextTab.pageId),
      nextTab.pageId,
    ],
  });
}

export function removeTabByPageId(
  state: StoredTabsState,
  pageId: string,
): StoredTabsState {
  return dedupeAndSanitizeTabsState({
    tabs: state.tabs.filter((tab) => tab.pageId !== pageId),
    recentPageIds: state.recentPageIds.filter(
      (recentPageId) => recentPageId !== pageId,
    ),
  });
}

export function getNextRecentTabPageId(state: StoredTabsState) {
  const sanitizedState = dedupeAndSanitizeTabsState(state);

  return sanitizedState.recentPageIds.at(-1) ?? null;
}

export function reconcileTabsWithProjects(
  state: StoredTabsState,
  projects: TabProjectSummary[],
): StoredTabsState {
  const projectsById = new Map<string, TabProjectSummary>(
    projects.map((project) => [project.id, project] as const),
  );

  return dedupeAndSanitizeTabsState({
    tabs: state.tabs.flatMap((tab) => {
      const project = projectsById.get(tab.projectId);

      if (!project) {
        return [];
      }

      const page = project.pages.find((candidatePage) => candidatePage.id === tab.pageId);

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
        },
      ];
    }),
    recentPageIds: state.recentPageIds,
  });
}
