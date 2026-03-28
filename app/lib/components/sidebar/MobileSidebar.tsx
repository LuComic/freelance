"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
  Folder,
  Bell,
} from "lucide-react";
import { Files } from "./Files";
import { Connections } from "./Connections";
import { SidebarSettings } from "./SidebarSettings";
import { CreateProjectModal } from "@/app/lib/components/project/CreateProjectModal";
import Link from "next/link";
import { LogOutButton } from "../LogOutButton";
import { SidebarUserInfo, type SidebarUserProfile } from "./SidebarUserInfo";
import { useSidebarController } from "./SidebarControllerContext";
import { Authenticated } from "convex/react";

export const MobileSidebar = ({
  userProfile,
}: {
  userProfile: SidebarUserProfile;
}) => {
  const isAnonymous = userProfile?.isAnonymous === true;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [handledRequestVersion, setHandledRequestVersion] = useState(0);
  const [activeTab, setActiveTab] = useState<"files" | "friends" | "settings">(
    "files",
  );
  const connections = useQuery(api.connections.queries.listSidebarConnections);
  const hasUnreadNotifications = useQuery(
    api.notifications.queries.hasUnreadNotifications,
  );
  const { requestedConnectionsSection, requestVersion } =
    useSidebarController();
  const hasPendingConnectionsRequest =
    !isAnonymous &&
    requestedConnectionsSection !== null &&
    requestVersion > handledRequestVersion;
  const resolvedSidebarOpen = hasPendingConnectionsRequest ? true : sidebarOpen;
  const resolvedActiveTab = isAnonymous
    ? activeTab === "friends"
      ? "files"
      : activeTab
    : hasPendingConnectionsRequest
      ? "friends"
      : activeTab;

  const acknowledgeConnectionsRequest = () => {
    if (requestVersion > handledRequestVersion) {
      setHandledRequestVersion(requestVersion);
    }
  };

  return (
    <div className="block md:hidden">
      {resolvedSidebarOpen ? (
        <nav className="w-90.75 h-dvh max-h-dvh bg-(--darkest) border-r border-(--gray) flex flex-col items-start justify-start p-2 gap-4 fixed z-30 top-0 left-0 overflow-hidden">
          <div className="flex items-center justify-between w-full">
            <Link href="/projects" className="text-(--gray) text-xl inline">
              Pageboard
              <span className="text-(--light) ml-1">Beta</span>
            </Link>
            <button
              onClick={() => {
                acknowledgeConnectionsRequest();
                setSidebarOpen(false);
              }}
              className=" p-1 rounded-lg hover:bg-(--darkest-hover)"
            >
              <PanelLeftClose size={22} />
            </button>
          </div>

          <div className="flex items-center justify-around p-1 rounded-lg bg-(--dim) w-full gap-1">
            <button
              className={` p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                resolvedActiveTab === "files"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => {
                acknowledgeConnectionsRequest();
                setActiveTab("files");
              }}
            >
              <Folder size={20} className="mx-auto" />
            </button>
            {!isAnonymous ? (
              <button
                className={` p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                  resolvedActiveTab === "friends"
                    ? "bg-(--quite-dark) text-(--vibrant)"
                    : ""
                }`}
                onClick={() => {
                  acknowledgeConnectionsRequest();
                  setActiveTab("friends");
                }}
              >
                <Users size={20} className="mx-auto" />
              </button>
            ) : null}
            <button
              className={` p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
                resolvedActiveTab === "settings"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => {
                acknowledgeConnectionsRequest();
                setActiveTab("settings");
              }}
            >
              <Settings size={20} className="mx-auto" />
            </button>
            {!isAnonymous ? (
              <CreateProjectModal redirectWhenBlocked="/settings?section=plan" />
            ) : null}
          </div>

          {resolvedActiveTab === "files" ? <Files /> : null}
          {!isAnonymous && resolvedActiveTab === "friends" ? (
            <Connections connections={connections} />
          ) : null}
          {resolvedActiveTab === "settings" ? <SidebarSettings /> : null}
          <div className="mt-auto w-full h-max flex items-center">
            <SidebarUserInfo profile={userProfile} />
            <Authenticated>
              <Link
                className={`ml-auto p-1 flex items-center justify-center aspect-square rounded-lg h-full hover:bg-(--darkest-hover) ${
                  hasUnreadNotifications ? "notification relative" : ""
                }`}
                href="/notifications"
              >
                <Bell size={20} />
              </Link>
              <LogOutButton sidebar={true} />
            </Authenticated>
          </div>
        </nav>
      ) : (
        <button
          onClick={() => {
            acknowledgeConnectionsRequest();
            setSidebarOpen(true);
          }}
          className="bg-(--darkest) z-30 p-2 rounded-lg hover:bg-(--darkest-hover) fixed bottom-2 left-2"
        >
          <PanelLeftOpen size={24} />
        </button>
      )}
    </div>
  );
};
