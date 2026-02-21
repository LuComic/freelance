const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export const SIDEBAR_COOKIE = "freelance-sidebar-open";
export const CHAT_COOKIE = "freelance-chat-open";
export const FEEDBACK_CLIENT_LAYOUT_COOKIE = "freelance-feedback-client-layout";
export const FEEDBACK_CREATOR_LAYOUT_COOKIE =
  "freelance-feedback-creator-layout";

export function setCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(
    value
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
