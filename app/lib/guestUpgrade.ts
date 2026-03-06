export const GUEST_UPGRADE_TOKEN_STORAGE_KEY =
  "freelance-guest-upgrade-token";

export function getStoredGuestUpgradeToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(GUEST_UPGRADE_TOKEN_STORAGE_KEY);
}

export function storeGuestUpgradeToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(GUEST_UPGRADE_TOKEN_STORAGE_KEY, token);
}

export function clearStoredGuestUpgradeToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(GUEST_UPGRADE_TOKEN_STORAGE_KEY);
}
