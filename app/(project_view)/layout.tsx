import type { Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { cookies } from "next/headers";
import { ConvexClientProvider } from "../ConvexClientProvider";
import { Sidebar } from "../lib/components/sidebar/Sidebar";
import { Chat } from "../lib/components/chat/Chat";
import { SearchBar } from "../lib/components/searchbar/SearchBar";
import {
  SIDEBAR_COOKIE,
  CHAT_COOKIE,
  SIDEBAR_WIDTH_COOKIE,
  CHAT_WIDTH_COOKIE,
  TABS_COOKIE,
  parsePanelWidthCookie,
} from "../lib/cookies";
import { Tab } from "../lib/components/tab/Tab";
import { parseTabsCookie } from "../lib/components/tab/tabState";
import { TopBar } from "../lib/components/project/TopBar";
import { EditModeProvider } from "../lib/components/project/EditModeContext";
import { PageDocumentProvider } from "../lib/components/project/PageDocumentContext";
import { SearchBarProvider } from "../lib/components/searchbar/SearchBarContext";
import { SidebarControllerProvider } from "../lib/components/sidebar/SidebarControllerContext";
import { DesktopPanelLayoutProvider } from "../lib/components/project/DesktopPanelLayoutContext";
import {
  CHAT_DEFAULT_WIDTH,
  CHAT_MAX_WIDTH,
  CHAT_MIN_WIDTH,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
} from "../lib/components/project/desktopPanelSizing";

export const metadata: Metadata = {
  title: "Pageboard",
  description: "The best platform for client-freelancer communication.",
};

export default async function ProjectViewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sidebarValue = cookieStore.get(SIDEBAR_COOKIE)?.value;
  const chatValue = cookieStore.get(CHAT_COOKIE)?.value;
  const sidebarWidthValue = cookieStore.get(SIDEBAR_WIDTH_COOKIE)?.value;
  const chatWidthValue = cookieStore.get(CHAT_WIDTH_COOKIE)?.value;
  const tabsValue = cookieStore.get(TABS_COOKIE)?.value;
  const initialSidebarOpen =
    sidebarValue != null ? sidebarValue === "true" : undefined;
  const initialChatOpen = chatValue != null ? chatValue === "true" : undefined;
  const initialSidebarWidth = parsePanelWidthCookie(
    sidebarWidthValue,
    SIDEBAR_MIN_WIDTH,
    SIDEBAR_MAX_WIDTH,
    SIDEBAR_DEFAULT_WIDTH,
  );
  const initialChatWidth = parsePanelWidthCookie(
    chatWidthValue,
    CHAT_MIN_WIDTH,
    CHAT_MAX_WIDTH,
    CHAT_DEFAULT_WIDTH,
  );
  const initialTabsState = parseTabsCookie(tabsValue);

  return (
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>
        <div
          className="antialiased min-h-dvh h-auto w-full flex items-start justify-start md:h-dvh md:items-stretch md:overflow-hidden"
          style={{
            scrollbarColor: "gray transparent",
            scrollbarWidth: "thin",
          }}
        >
          <SearchBarProvider>
            <SidebarControllerProvider>
              <DesktopPanelLayoutProvider
                initialSidebarWidth={initialSidebarWidth}
                initialChatWidth={initialChatWidth}
              >
                <Sidebar
                  initialSidebarOpen={initialSidebarOpen}
                  initialSidebarWidth={initialSidebarWidth}
                />
                <EditModeProvider>
                  <PageDocumentProvider>
                    <SearchBar />
                    <div className="relative flex-1 min-w-0 flex flex-col items-start justify-start md:h-full md:min-h-0">
                      <Tab initialTabsState={initialTabsState} />
                      <TopBar />
                      <div className="@container w-full md:px-4 px-2 pt-4 pb-8 flex flex-col items-start justify-start gap-4 md:flex-1 md:min-h-0 md:overflow-y-auto">
                        {children}
                      </div>
                    </div>
                    <Chat
                      initialChatOpen={initialChatOpen}
                      initialChatWidth={initialChatWidth}
                    />
                  </PageDocumentProvider>
                </EditModeProvider>
              </DesktopPanelLayoutProvider>
            </SidebarControllerProvider>
          </SearchBarProvider>
        </div>
      </ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
