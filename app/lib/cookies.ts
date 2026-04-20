const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export const SIDEBAR_COOKIE = "freelance-sidebar-open";
export const CHAT_COOKIE = "freelance-chat-open";
export const SIDEBAR_WIDTH_COOKIE = "freelance-sidebar-width";
export const CHAT_WIDTH_COOKIE = "freelance-chat-width";
export const TABS_COOKIE = "freelance-open-tabs";
export const FEEDBACK_CLIENT_LAYOUT_COOKIE = "freelance-feedback-client-layout";
export const SHOW_SUGGESTIONS_COOKIE = "freelance-show-suggestions";

export function setCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const prefixedName = `${name}=`;
  const cookieValue = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefixedName));

  if (!cookieValue) return undefined;

  return decodeURIComponent(cookieValue.slice(prefixedName.length));
}

export function parsePanelWidthCookie(
  value: string | undefined,
  min: number,
  max: number,
  fallback: number,
): number {
  const trimmedValue = value?.trim();

  if (!trimmedValue) return fallback;

  const parsedWidth = Number(trimmedValue);

  if (!Number.isFinite(parsedWidth)) return fallback;

  return Math.min(Math.max(parsedWidth, min), max);
}
