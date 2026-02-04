"use client";

import { DesktopSidebar } from "./DesktopSidebar";
import { MobileSidebar } from "./MobileSidebar";

type SidebarProps = {
  initialSidebarOpen?: boolean;
};

export const Sidebar = ({ initialSidebarOpen }: SidebarProps) => {
  return (
    <>
      <DesktopSidebar initialOpen={initialSidebarOpen} />
      <MobileSidebar />
    </>
  );
};
