"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useMediaQuery } from "@/app/lib/hooks/useMediaQuery";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileSidebar } from "./MobileSidebar";

type SidebarProps = {
  initialSidebarOpen?: boolean;
};

export const Sidebar = ({ initialSidebarOpen }: SidebarProps) => {
  const userProfile = useQuery(api.users.queries.currentProfile);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop === null) {
    return null;
  }

  return isDesktop ? (
    <DesktopSidebar
      initialOpen={initialSidebarOpen}
      userProfile={userProfile}
    />
  ) : (
    <MobileSidebar userProfile={userProfile} />
  );
};
