import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { Sidebar } from "./lib/components/sidebar/Sidebar";
import { Chat } from "./lib/components/chat/Chat";
import { SearchBar } from "./lib/components/searchbar/SearchBar";
import { SIDEBAR_COOKIE, CHAT_COOKIE } from "./lib/cookies";
import { Tab } from "./lib/components/tab/Tab";
import { TopBar } from "./lib/components/project/TopBar";
import { EditModeProvider } from "./lib/components/project/EditModeContext";

export const metadata: Metadata = {
  title: "Cliff",
  description: "The best platform for client-freelancer communiaction.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sidebarValue = cookieStore.get(SIDEBAR_COOKIE)?.value;
  const chatValue = cookieStore.get(CHAT_COOKIE)?.value;
  const initialSidebarOpen =
    sidebarValue != null ? sidebarValue === "true" : undefined;
  const initialChatOpen = chatValue != null ? chatValue === "true" : undefined;

  return (
    <html lang="en">
      <body
        className="antialiased min-h-dvh h-auto w-screen flex items-start justify-start"
        style={{
          scrollbarColor: "gray transparent",
          scrollbarWidth: "thin",
        }}
      >
        <SearchBar />
        <Sidebar initialSidebarOpen={initialSidebarOpen} />
        <div className="flex-1 min-w-0 flex flex-col items-start justify-start">
          <Tab />
          <EditModeProvider>
            <TopBar />
            <div className="w-full px-4 md:pt-8 pt-15 pb-8 flex flex-col items-start justify-start gap-4">
              {children}
            </div>
          </EditModeProvider>
        </div>
        <Chat initialChatOpen={initialChatOpen} />
      </body>
    </html>
  );
}
