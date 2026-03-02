"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type SidebarConnectionsSection = "invites" | "got" | "friends";

type SidebarControllerContextValue = {
  requestedConnectionsSection: SidebarConnectionsSection | null;
  requestVersion: number;
  openConnectionsSection: (section: SidebarConnectionsSection) => void;
};

const SidebarControllerContext =
  createContext<SidebarControllerContextValue | null>(null);

export const SidebarControllerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [requestedConnectionsSection, setRequestedConnectionsSection] =
    useState<SidebarConnectionsSection | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  const value = useMemo<SidebarControllerContextValue>(
    () => ({
      requestedConnectionsSection,
      requestVersion,
      openConnectionsSection: (section) => {
        setRequestedConnectionsSection(section);
        setRequestVersion((previous) => previous + 1);
      },
    }),
    [requestVersion, requestedConnectionsSection],
  );

  return (
    <SidebarControllerContext.Provider value={value}>
      {children}
    </SidebarControllerContext.Provider>
  );
};

export function useSidebarController() {
  const context = useContext(SidebarControllerContext);

  if (!context) {
    throw new Error(
      "useSidebarController must be used within SidebarControllerProvider.",
    );
  }

  return context;
}
