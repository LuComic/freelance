export const PROJECT_ROUTE_RESERVED_SEGMENTS = new Set([
  "analytics",
  "settings",
  "terms",
  "privacy",
  "cookies",
]);

export function getProjectPath(projectId: string) {
  return `/projects/${projectId}`;
}

export function getProjectPagePath(projectId: string, pageId: string) {
  return `${getProjectPath(projectId)}/${pageId}`;
}

export function getProjectSettingsPath(projectId: string) {
  return `${getProjectPath(projectId)}/settings`;
}

export function getProjectAnalyticsPath(projectId: string) {
  return `${getProjectPath(projectId)}/analytics`;
}
