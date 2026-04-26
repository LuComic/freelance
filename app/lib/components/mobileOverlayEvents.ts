const MOBILE_CHAT_OPEN_EVENT = "pageboard:mobile-chat-open";
const MOBILE_SIDEBAR_OPEN_EVENT = "pageboard:mobile-sidebar-open";

function dispatchMobileOverlayEvent(eventName: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(eventName));
}

function listenForMobileOverlayEvent(eventName: string, handler: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(eventName, handler);
  return () => window.removeEventListener(eventName, handler);
}

export function announceMobileChatOpen() {
  dispatchMobileOverlayEvent(MOBILE_CHAT_OPEN_EVENT);
}

export function announceMobileSidebarOpen() {
  dispatchMobileOverlayEvent(MOBILE_SIDEBAR_OPEN_EVENT);
}

export function listenForMobileChatOpen(handler: () => void) {
  return listenForMobileOverlayEvent(MOBILE_CHAT_OPEN_EVENT, handler);
}

export function listenForMobileSidebarOpen(handler: () => void) {
  return listenForMobileOverlayEvent(MOBILE_SIDEBAR_OPEN_EVENT, handler);
}
