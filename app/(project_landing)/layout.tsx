import type { Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { cookies } from "next/headers";
import { ConvexClientProvider } from "../ConvexClientProvider";
import {
  SIDEBAR_COOKIE,
  SIDEBAR_WIDTH_COOKIE,
  parsePanelWidthCookie,
} from "../lib/cookies";
import { DesktopPanelLayoutProvider } from "../lib/components/project/DesktopPanelLayoutContext";
import {
  CHAT_DEFAULT_WIDTH,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
} from "../lib/components/project/desktopPanelSizing";
import { SearchBar } from "../lib/components/searchbar/SearchBar";
import { SearchBarProvider } from "../lib/components/searchbar/SearchBarContext";
import { Sidebar } from "../lib/components/sidebar/Sidebar";
import { SidebarControllerProvider } from "../lib/components/sidebar/SidebarControllerContext";

export const metadata: Metadata = {
  title: "Pageboard",
  description: "The best platform for client-freelancer communication.",
};

export default async function ProjectLandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sidebarValue = cookieStore.get(SIDEBAR_COOKIE)?.value;
  const sidebarWidthValue = cookieStore.get(SIDEBAR_WIDTH_COOKIE)?.value;
  const initialSidebarOpen =
    sidebarValue != null ? sidebarValue === "true" : undefined;
  const initialSidebarWidth = parsePanelWidthCookie(
    sidebarWidthValue,
    SIDEBAR_MIN_WIDTH,
    SIDEBAR_MAX_WIDTH,
    SIDEBAR_DEFAULT_WIDTH,
  );

  return (
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>
        <div
          className="antialiased min-h-dvh h-auto w-full flex items-start justify-start bg-(--quite-dark) text-(--light) md:h-dvh md:items-stretch md:overflow-hidden"
          style={{
            scrollbarColor: "gray transparent",
            scrollbarWidth: "thin",
          }}
        >
          <SearchBarProvider>
            <SidebarControllerProvider>
              <DesktopPanelLayoutProvider
                initialSidebarWidth={initialSidebarWidth}
                initialChatWidth={CHAT_DEFAULT_WIDTH}
              >
                <Sidebar
                  initialSidebarOpen={initialSidebarOpen}
                  initialSidebarWidth={initialSidebarWidth}
                />
                <SearchBar />
                <main className="@container w-full md:px-4 px-2 pt-4 pb-8 flex flex-col items-start justify-start gap-4 md:flex-1 md:min-h-0 md:overflow-y-auto">
                  {children}
                </main>
              </DesktopPanelLayoutProvider>
            </SidebarControllerProvider>
          </SearchBarProvider>
        </div>
      </ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
