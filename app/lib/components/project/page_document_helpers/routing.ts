import type { ActivePageState, ProjectPageSummary } from "./types";
import {
  getProjectPagePath,
  PROJECT_ROUTE_RESERVED_SEGMENTS,
} from "../paths";

export type PageRoute = {
  projectId: string;
  pageId: string;
};

export function getPageRoute(pathname: string): PageRoute | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "projects" || segments.length < 3) {
    return null;
  }

  const pageId = segments[2];
  if (PROJECT_ROUTE_RESERVED_SEGMENTS.has(pageId)) {
    return null;
  }

  return {
    projectId: segments[1],
    pageId,
  };
}

export function canReuseActivePageForRoute(args: {
  route: PageRoute | null;
  activePage: ActivePageState | null;
}) {
  const { route, activePage } = args;

  if (!route || !activePage) {
    return false;
  }

  return (
    activePage.project.id === route.projectId &&
    activePage.page.id === route.pageId
  );
}

export function resolveDeleteRedirectPath(args: {
  currentPageId: string;
  projectId: string;
  projectPages: ProjectPageSummary[];
  visitHistoryPageIds: string[];
}) {
  const { currentPageId, projectId, projectPages, visitHistoryPageIds } =
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
      return getProjectPagePath(projectId, candidatePage.id);
    }
  }

  const currentPageIndex = projectPages.findIndex(
    (page) => page.id === currentPageId,
  );
  const previousSibling =
    currentPageIndex > 0 ? projectPages[currentPageIndex - 1] : null;

  if (previousSibling && previousSibling.id !== currentPageId) {
    return getProjectPagePath(projectId, previousSibling.id);
  }

  const nextSibling =
    currentPageIndex >= 0 ? projectPages[currentPageIndex + 1] : null;

  if (nextSibling && nextSibling.id !== currentPageId) {
    return getProjectPagePath(projectId, nextSibling.id);
  }

  return getProjectPagePath(projectId, remainingPages[0].id);
}
