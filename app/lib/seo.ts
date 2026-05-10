export const SITE_URL = "https://www.pageboard.app";

export function canonicalUrl(path: string = "/") {
  return `${SITE_URL}${path === "/" ? "" : path}`;
}
