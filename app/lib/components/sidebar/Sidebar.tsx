"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileSidebar } from "./MobileSidebar";

type SidebarProps = {
  initialSidebarOpen?: boolean;
};

export const Sidebar = ({ initialSidebarOpen }: SidebarProps) => {
  const userProfile = useQuery(api.users.queries.currentProfile);

  return (
    <>
      <DesktopSidebar
        initialOpen={initialSidebarOpen}
        userProfile={userProfile}
      />
      <MobileSidebar userProfile={userProfile} />
    </>
  );
};
