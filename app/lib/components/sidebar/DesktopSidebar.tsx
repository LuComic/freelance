"use client";

import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Settings,
  Bell,
  Folder,
} from "lucide-react";
import { Files } from "./Files";
import { Connections } from "./Connections";
import { SidebarSettings } from "./SidebarSettings";
import { setCookie, SIDEBAR_COOKIE } from "@/app/lib/cookies";
import { CreateProjectModal } from "@/app/lib/components/project/CreateProjectModal";
import Link from "next/link";
import { LogOutButton } from "../LogOutButton";
import { SidebarUserInfo, type SidebarUserProfile } from "./SidebarUserInfo";
import { useSidebarController } from "./SidebarControllerContext";
import { Authenticated } from "convex/react";

type DesktopSidebarProps = {
  initialOpen?: boolean;
  userProfile: SidebarUserProfile;
};

export const DesktopSidebar = ({
  initialOpen,
  userProfile,
}: DesktopSidebarProps) => {
  const isAnonymous = userProfile?.isAnonymous === true;
  const [sidebarOpen, setSidebarOpen] = useState(initialOpen ?? true);
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

  useEffect(() => {
    setCookie(SIDEBAR_COOKIE, String(resolvedSidebarOpen));
  }, [resolvedSidebarOpen]);

  useEffect(() => {
    const onKeyDownHandler = (e: KeyboardEvent) => {
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        setSidebarOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDownHandler);

    return () => document.removeEventListener("keydown", onKeyDownHandler);
  }, []);

  const notificationClassName = `ml-auto p-1 flex items-center justify-center aspect-square rounded-lg h-full hover:bg-(--darkest-hover) ${
    hasUnreadNotifications ? "notification relative" : ""
  }`;

  return (
    <div className="hidden md:block self-stretch">
      {resolvedSidebarOpen ? (
        <nav className="w-90.75 h-full min-h-dvh bg-(--darkest) border-r border-(--gray) flex flex-col items-start justify-start p-2 px-3 gap-4 overflow-hidden">
          <div className="flex items-center justify-between w-full">
            <Link href="/projects" className="text-(--gray) text-xl">
              Pageboard
            </Link>
            <button
              onClick={() => {
                acknowledgeConnectionsRequest();
                setSidebarOpen(false);
              }}
              className=" p-1 rounded-lg hover:bg-(--darkest-hover)"
            >
              <PanelLeftClose size={20} />
            </button>
          </div>
          <div className="flex items-center justify-around p-1 rounded-xl bg-(--dim) w-full gap-1">
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
              className={`p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
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
              <Link className={notificationClassName} href="/notifications">
                <Bell size={20} />
              </Link>
              <LogOutButton sidebar={true} />
            </Authenticated>
          </div>
        </nav>
      ) : (
        <nav className="w-12.5 h-full min-h-dvh bg-(--darkest) border-r border-(--gray) flex flex-col items-center justify-start p-2 gap-4">
          <button
            onClick={() => {
              acknowledgeConnectionsRequest();
              setSidebarOpen(true);
            }}
            className=" p-1 rounded-lg hover:bg-(--darkest-hover)"
          >
            <PanelLeftOpen size={20} />
          </button>
          <div className="flex flex-col bg-(--dim) rounded-lg justify-center p-1 h-max gap-4">
            <button
              className={`h-full  p-1 rounded-md hover:bg-(--quite-dark) w-full ${
                resolvedActiveTab === "files"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => {
                acknowledgeConnectionsRequest();
                setActiveTab("files");
                setSidebarOpen(true);
              }}
            >
              <Folder size={20} className="mx-auto" />
            </button>
            {!isAnonymous ? (
              <button
                className={`h-full  p-1 rounded-md hover:bg-(--quite-dark) w-full ${
                  resolvedActiveTab === "friends"
                    ? "bg-(--quite-dark) text-(--vibrant)"
                    : ""
                }`}
                onClick={() => {
                  acknowledgeConnectionsRequest();
                  setActiveTab("friends");
                  setSidebarOpen(true);
                }}
              >
                <Users size={20} className="mx-auto" />
              </button>
            ) : null}
            <button
              className={`h-full  p-1 rounded-md hover:bg-(--quite-dark) w-full ${
                resolvedActiveTab === "settings"
                  ? "bg-(--quite-dark) text-(--vibrant)"
                  : ""
              }`}
              onClick={() => {
                acknowledgeConnectionsRequest();
                setActiveTab("settings");
                setSidebarOpen(true);
              }}
            >
              <Settings size={20} className="mx-auto" />
            </button>
            {!isAnonymous ? (
              <CreateProjectModal redirectWhenBlocked="/settings?section=plan" />
            ) : null}
          </div>
          <div className="flex flex-col gap-2 items-center justify-center mt-auto w-full">
            <SidebarUserInfo profile={userProfile} compact={true} />
            <Authenticated>
              <Link
                className={`aspect-square p-1 rounded-md hover:bg-(--darkest-hover) w-full ${
                  hasUnreadNotifications ? "notification relative" : ""
                }`}
                href="/notifications"
              >
                <Bell size={20} className="mx-auto" />
              </Link>
            </Authenticated>
          </div>
        </nav>
      )}
    </div>
  );
};
