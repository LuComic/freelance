import {
  getProjectAnalyticsPath,
  getProjectPagePath,
  getProjectPath,
  getProjectSettingsPath,
} from "../project/paths";

export type StoredTabKind =
  | "projectsIndex"
  | "notifications"
  | "accountSettings"
  | "legalOverview"
  | "legalTerms"
  | "legalPrivacy"
  | "legalCookies"
  | "projectRoot"
  | "projectSettings"
  | "projectAnalytics"
  | "projectPage";

export type StoredTab = {
  tabId: string;
  kind: StoredTabKind;
  path: string;
  title: string;
  contextLabel: string;
  projectId?: string;
  pageId?: string;
};

type LegacyStoredTab = {
  pageId: string;
  projectId: string;
  pageTitle: string;
  projectName: string;
};

export type StoredTabsState = {
  tabs: StoredTab[];
  recentTabIds: string[];
};

export type TabProjectSummary = {
  id: string;
  name: string;
  pages: Array<{
    id: string;
    title: string;
  }>;
};

type ActivePageTabInput = {
  project: {
    id: string;
    name: string;
  };
  page: {
    id: string;
    title: string;
  };
};

const MAX_STORED_TABS = 20;

const STATIC_TABS = {
  projectsIndex: {
    tabId: "projects-index",
    kind: "projectsIndex",
    path: "/projects",
    title: "Projects",
    contextLabel: "Workspace",
  },
  notifications: {
    tabId: "notifications",
    kind: "notifications",
    path: "/notifications",
    title: "Notifications",
    contextLabel: "Workspace",
  },
  accountSettings: {
    tabId: "account-settings",
    kind: "accountSettings",
    path: "/settings",
    title: "Settings",
    contextLabel: "Account",
  },
  legalOverview: {
    tabId: "legal-overview",
    kind: "legalOverview",
    path: "/legal",
    title: "Legal",
    contextLabel: "Workspace",
  },
  legalTerms: {
    tabId: "legal-terms",
    kind: "legalTerms",
    path: "/legal/terms",
    title: "Terms",
    contextLabel: "Legal",
  },
  legalPrivacy: {
    tabId: "legal-privacy",
    kind: "legalPrivacy",
    path: "/legal/privacy",
    title: "Privacy",
    contextLabel: "Legal",
  },
  legalCookies: {
    tabId: "legal-cookies",
    kind: "legalCookies",
    path: "/legal/cookies",
    title: "Cookies",
    contextLabel: "Legal",
  },
} satisfies Record<
  Exclude<
    StoredTabKind,
    "projectRoot" | "projectSettings" | "projectAnalytics" | "projectPage"
  >,
  StoredTab
>;

export const EMPTY_TABS_STATE: StoredTabsState = {
  tabs: [],
  recentTabIds: [],
};

function isStoredTabKind(value: unknown): value is StoredTabKind {
  return (
    value === "projectsIndex" ||
    value === "notifications" ||
    value === "accountSettings" ||
    value === "legalOverview" ||
    value === "legalTerms" ||
    value === "legalPrivacy" ||
    value === "legalCookies" ||
    value === "projectRoot" ||
    value === "projectSettings" ||
    value === "projectAnalytics" ||
    value === "projectPage"
  );
}

function isStoredTab(value: unknown): value is StoredTab {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const tab = value as Partial<StoredTab>;
  return (
    typeof tab.tabId === "string" &&
    isStoredTabKind(tab.kind) &&
    typeof tab.path === "string" &&
    typeof tab.title === "string" &&
    typeof tab.contextLabel === "string"
  );
}

function isLegacyStoredTab(value: unknown): value is LegacyStoredTab {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const tab = value as Partial<LegacyStoredTab>;

  return (
    typeof tab.pageId === "string" &&
    typeof tab.projectId === "string" &&
    typeof tab.pageTitle === "string" &&
    typeof tab.projectName === "string"
  );
}

function fromLegacyStoredTab(tab: LegacyStoredTab): StoredTab {
  return {
    tabId: `project-page:${tab.pageId}`,
    kind: "projectPage",
    path: getProjectPagePath(tab.projectId, tab.pageId),
    title: tab.pageTitle,
    contextLabel: tab.projectName,
    projectId: tab.projectId,
    pageId: tab.pageId,
  };
}

function normalizeStoredTab(tab: StoredTab): StoredTab | null {
  switch (tab.kind) {
    case "projectsIndex":
      return STATIC_TABS.projectsIndex;
    case "notifications":
      return STATIC_TABS.notifications;
    case "accountSettings":
      return STATIC_TABS.accountSettings;
    case "legalOverview":
      return STATIC_TABS.legalOverview;
    case "legalTerms":
      return STATIC_TABS.legalTerms;
    case "legalPrivacy":
      return STATIC_TABS.legalPrivacy;
    case "legalCookies":
      return STATIC_TABS.legalCookies;
    case "projectRoot":
      return tab.projectId
        ? {
            ...tab,
            path: getProjectPath(tab.projectId),
          }
        : null;
    case "projectSettings":
      return tab.projectId
        ? {
            ...tab,
            path: getProjectSettingsPath(tab.projectId),
          }
        : null;
    case "projectAnalytics":
      return tab.projectId
        ? {
            ...tab,
            path: getProjectAnalyticsPath(tab.projectId),
          }
        : null;
    case "projectPage":
      return tab.projectId && tab.pageId
        ? {
            ...tab,
            path: getProjectPagePath(tab.projectId, tab.pageId),
          }
        : null;
  }
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

function getStaticTabFromPath(pathname: string) {
  switch (pathname) {
    case "/projects":
      return STATIC_TABS.projectsIndex;
    case "/notifications":
      return STATIC_TABS.notifications;
    case "/settings":
      return STATIC_TABS.accountSettings;
    case "/legal":
      return STATIC_TABS.legalOverview;
    case "/legal/terms":
      return STATIC_TABS.legalTerms;
    case "/legal/privacy":
      return STATIC_TABS.legalPrivacy;
    case "/legal/cookies":
      return STATIC_TABS.legalCookies;
    default:
      return null;
  }
}

function createProjectRootTab(project: TabProjectSummary): StoredTab {
  return {
    tabId: `project-root:${project.id}`,
    kind: "projectRoot",
    path: getProjectPath(project.id),
    title: project.name,
    contextLabel: "Project",
    projectId: project.id,
  };
}

function createProjectSettingsTab(project: TabProjectSummary): StoredTab {
  return {
    tabId: `project-settings:${project.id}`,
    kind: "projectSettings",
    path: getProjectSettingsPath(project.id),
    title: "Project Settings",
    contextLabel: project.name,
    projectId: project.id,
  };
}

function createProjectAnalyticsTab(project: TabProjectSummary): StoredTab {
  return {
    tabId: `project-analytics:${project.id}`,
    kind: "projectAnalytics",
    path: getProjectAnalyticsPath(project.id),
    title: "Analytics",
    contextLabel: project.name,
    projectId: project.id,
  };
}

export function createProjectPageTab(
  activePage: ActivePageTabInput,
): StoredTab {
  return {
    tabId: `project-page:${activePage.page.id}`,
    kind: "projectPage",
    path: getProjectPagePath(activePage.project.id, activePage.page.id),
    title: activePage.page.title,
    contextLabel: activePage.project.name,
    projectId: activePage.project.id,
    pageId: activePage.page.id,
  };
}

export function resolveTabForRoute({
  pathname,
  projects,
  activePage,
}: {
  pathname: string;
  projects?: TabProjectSummary[];
  activePage?: ActivePageTabInput | null;
}): StoredTab | null {
  const staticTab = getStaticTabFromPath(pathname);

  if (staticTab) {
    return staticTab;
  }

  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] !== "projects") {
    return null;
  }

  if (segments.length === 1) {
    return STATIC_TABS.projectsIndex;
  }

  if (segments.length > 3) {
    return null;
  }

  const projectId = segments[1];
  const project = projects?.find((candidate) => candidate.id === projectId);

  if (!project) {
    if (
      activePage &&
      activePage.project.id === projectId &&
      segments[2] === activePage.page.id
    ) {
      return createProjectPageTab(activePage);
    }

    return null;
  }

  if (segments.length === 2) {
    return createProjectRootTab(project);
  }

  const nestedSegment = segments[2];

  if (nestedSegment === "settings") {
    return createProjectSettingsTab(project);
  }

  if (nestedSegment === "analytics") {
    return createProjectAnalyticsTab(project);
  }

  if (
    activePage &&
    activePage.project.id === project.id &&
    activePage.page.id === nestedSegment
  ) {
    return createProjectPageTab(activePage);
  }

  const page = project.pages.find((candidate) => candidate.id === nestedSegment);

  if (!page) {
    return null;
  }

  return {
    tabId: `project-page:${page.id}`,
    kind: "projectPage",
    path: getProjectPagePath(project.id, page.id),
    title: page.title,
    contextLabel: project.name,
    projectId: project.id,
    pageId: page.id,
  };
}

export function dedupeAndSanitizeTabsState(
  state: StoredTabsState,
): StoredTabsState {
  const seenTabIds = new Set<string>();
  const nextTabs: StoredTab[] = [];

  for (const tab of state.tabs) {
    if (!isStoredTab(tab) || seenTabIds.has(tab.tabId)) {
      continue;
    }

    const normalizedTab = normalizeStoredTab(tab);

    if (!normalizedTab) {
      continue;
    }

    seenTabIds.add(normalizedTab.tabId);
    nextTabs.push(normalizedTab);
  }

  const nextRecentTabIds: string[] = [];
  const seenRecentIds = new Set<string>();

  for (const tabId of state.recentTabIds) {
    if (
      typeof tabId !== "string" ||
      seenRecentIds.has(tabId) ||
      !seenTabIds.has(tabId)
    ) {
      continue;
    }

    seenRecentIds.add(tabId);
    nextRecentTabIds.push(tabId);
  }

  while (nextTabs.length > MAX_STORED_TABS) {
    const removedTab = nextTabs.shift();

    if (!removedTab) {
      break;
    }
  }

  const remainingTabIds = new Set(nextTabs.map((tab) => tab.tabId));

  return {
    tabs: nextTabs,
    recentTabIds: nextRecentTabIds.filter((tabId) =>
      remainingTabIds.has(tabId),
    ),
  };
}

export function parseTabsCookie(value?: string | null): StoredTabsState {
  const parsedValue = parseRawTabsCookie(value);

  if (typeof parsedValue !== "object" || parsedValue === null) {
    return EMPTY_TABS_STATE;
  }

  const candidateState = parsedValue as Partial<StoredTabsState> & {
    recentPageIds?: unknown;
  };

  const rawTabs = Array.isArray(candidateState.tabs) ? candidateState.tabs : [];
  const tabs = rawTabs.flatMap((tab) => {
    if (isStoredTab(tab)) {
      const normalizedTab = normalizeStoredTab(tab);

      return normalizedTab ? [normalizedTab] : [];
    }

    if (isLegacyStoredTab(tab)) {
      const normalizedTab = normalizeStoredTab(fromLegacyStoredTab(tab));

      return normalizedTab ? [normalizedTab] : [];
    }

    return [];
  });

  const recentTabIds = Array.isArray(candidateState.recentTabIds)
    ? candidateState.recentTabIds.filter(
        (tabId): tabId is string => typeof tabId === "string",
      )
    : Array.isArray(candidateState.recentPageIds)
      ? candidateState.recentPageIds
          .filter((tabId): tabId is string => typeof tabId === "string")
          .map((tabId) => `project-page:${tabId}`)
      : [];

  return dedupeAndSanitizeTabsState({
    tabs,
    recentTabIds,
  });
}

export function serializeTabsCookie(state: StoredTabsState) {
  return JSON.stringify(dedupeAndSanitizeTabsState(state));
}

export function resolveTabPath(tab: StoredTab) {
  return tab.path;
}

export function upsertTab(
  state: StoredTabsState,
  nextTab: StoredTab,
): StoredTabsState {
  const existingTabIndex = state.tabs.findIndex(
    (tab) => tab.tabId === nextTab.tabId,
  );
  const nextTabs =
    existingTabIndex === -1
      ? [...state.tabs, nextTab]
      : state.tabs.map((tab, index) =>
          index === existingTabIndex ? nextTab : tab,
        );

  return dedupeAndSanitizeTabsState({
    tabs: nextTabs,
    recentTabIds: [
      ...state.recentTabIds.filter((tabId) => tabId !== nextTab.tabId),
      nextTab.tabId,
    ],
  });
}

export function removeTabById(
  state: StoredTabsState,
  tabId: string,
): StoredTabsState {
  return dedupeAndSanitizeTabsState({
    tabs: state.tabs.filter((tab) => tab.tabId !== tabId),
    recentTabIds: state.recentTabIds.filter(
      (recentTabId) => recentTabId !== tabId,
    ),
  });
}

export function getNextRecentTabId(state: StoredTabsState) {
  const sanitizedState = dedupeAndSanitizeTabsState(state);

  return sanitizedState.recentTabIds.at(-1) ?? null;
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
      switch (tab.kind) {
        case "projectPage": {
          if (!tab.projectId || !tab.pageId) {
            return [];
          }

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
              path: getProjectPagePath(project.id, page.id),
              title: page.title,
              contextLabel: project.name,
            },
          ];
        }
        case "projectRoot": {
          if (!tab.projectId) {
            return [];
          }

          const project = projectsById.get(tab.projectId);

          return project ? [createProjectRootTab(project)] : [];
        }
        case "projectSettings": {
          if (!tab.projectId) {
            return [];
          }

          const project = projectsById.get(tab.projectId);

          return project ? [createProjectSettingsTab(project)] : [];
        }
        case "projectAnalytics": {
          if (!tab.projectId) {
            return [];
          }

          const project = projectsById.get(tab.projectId);

          return project ? [createProjectAnalyticsTab(project)] : [];
        }
        default:
          return [tab];
      }
    }),
    recentTabIds: state.recentTabIds,
  });
}
