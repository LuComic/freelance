const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export const SIDEBAR_COOKIE = "freelance-sidebar-open";
export const CHAT_COOKIE = "freelance-chat-open";

export function setCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}
