import type { ActivePageState, ProjectPageSummary } from "./types";

export type PageRoute = {
  projectSlug: string;
  pageSlug: string;
};

export function getPageRoute(pathname: string): PageRoute | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "projects" || segments.length < 3) {
    return null;
  }

  const pageSlug = segments[2];
  if (
    pageSlug === "analytics" ||
    pageSlug === "settings" ||
    pageSlug === "terms" ||
    pageSlug === "privacy" ||
    pageSlug === "cookies"
  ) {
    return null;
  }

  return {
    projectSlug: segments[1],
    pageSlug,
  };
}

export function getProjectPagePath(projectSlug: string, pageSlug: string) {
  return `/projects/${projectSlug}/${pageSlug}`;
}

export function canReuseActivePageForRoute(args: {
  route: PageRoute | null;
  activePage: ActivePageState | null;
  pendingRouteProjectId: string | null;
  pendingRoutePageId: string | null;
}) {
  const { route, activePage, pendingRouteProjectId, pendingRoutePageId } = args;

  if (!route || !activePage) {
    return false;
  }

  return (
    (activePage.project.slug === route.projectSlug &&
      activePage.page.slug === route.pageSlug) ||
    (pendingRouteProjectId !== null &&
      activePage.project.id === pendingRouteProjectId) ||
    (pendingRoutePageId !== null && activePage.page.id === pendingRoutePageId)
  );
}

export function resolveDeleteRedirectPath(args: {
  currentPageId: string;
  projectSlug: string;
  projectPages: ProjectPageSummary[];
  visitHistoryPageIds: string[];
}) {
  const { currentPageId, projectSlug, projectPages, visitHistoryPageIds } =
    args;
  const remainingPages = projectPages.filter(
    (page) => page.id !== currentPageId,
  );

  if (remainingPages.length === 0) {
    return "/projects";
  }

  for (let index = visitHistoryPageIds.length - 1; index >= 0; index -= 1) {
    const candidatePageId = visitHistoryPageIds[index];
    const candidatePage = remainingPages.find(
      (page) => page.id === candidatePageId,
    );

    if (candidatePage) {
      return getProjectPagePath(projectSlug, candidatePage.slug);
    }
  }

  const currentPageIndex = projectPages.findIndex(
    (page) => page.id === currentPageId,
  );
  const previousSibling =
    currentPageIndex > 0 ? projectPages[currentPageIndex - 1] : null;

  if (previousSibling && previousSibling.id !== currentPageId) {
    return getProjectPagePath(projectSlug, previousSibling.slug);
  }

  const nextSibling =
    currentPageIndex >= 0 ? projectPages[currentPageIndex + 1] : null;

  if (nextSibling && nextSibling.id !== currentPageId) {
    return getProjectPagePath(projectSlug, nextSibling.slug);
  }

  return getProjectPagePath(projectSlug, remainingPages[0].slug);
}
