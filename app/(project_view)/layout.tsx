import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Sidebar } from "../lib/components/sidebar/Sidebar";
import { Chat } from "../lib/components/chat/Chat";
import { SearchBar } from "../lib/components/searchbar/SearchBar";
import { SIDEBAR_COOKIE, CHAT_COOKIE, TABS_COOKIE } from "../lib/cookies";
import { Tab } from "../lib/components/tab/Tab";
import { parseTabsCookie } from "../lib/components/tab/tabState";
import { TopBar } from "../lib/components/project/TopBar";
import { EditModeProvider } from "../lib/components/project/EditModeContext";
import { PageDocumentProvider } from "../lib/components/project/PageDocumentContext";
import { SearchBarProvider } from "../lib/components/searchbar/SearchBarContext";
import { SidebarControllerProvider } from "../lib/components/sidebar/SidebarControllerContext";

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
  const tabsValue = cookieStore.get(TABS_COOKIE)?.value;
  const initialSidebarOpen =
    sidebarValue != null ? sidebarValue === "true" : undefined;
  const initialChatOpen = chatValue != null ? chatValue === "true" : undefined;
  const initialTabsState = parseTabsCookie(tabsValue);

  return (
    <div
      className="antialiased min-h-dvh h-auto w-screen flex items-start justify-start md:h-dvh md:items-stretch md:overflow-hidden"
      style={{
        scrollbarColor: "gray transparent",
        scrollbarWidth: "thin",
      }}
    >
      <SearchBarProvider>
        <SidebarControllerProvider>
          <Sidebar initialSidebarOpen={initialSidebarOpen} />
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
              <Chat initialChatOpen={initialChatOpen} />
            </PageDocumentProvider>
          </EditModeProvider>
        </SidebarControllerProvider>
      </SearchBarProvider>
    </div>
  );
}
