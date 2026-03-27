"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useSidebarController } from "../sidebar/SidebarControllerContext";
import { getProjectAnalyticsPath } from "../project/paths";
import type { AppNotification } from "./types";

function formatNotificationDate(timestamp: number) {
  return new Intl.DateTimeFormat("et-EE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(timestamp));
}

function getNotificationText(notification: AppNotification) {
  switch (notification.type) {
    case "projectInviteReceived":
      return `${notification.actorName} invited you to '${notification.projectName ?? "a project"}'`;
    case "friendRequestReceived":
      return `${notification.actorName} sent you a friend request`;
    case "friendRequestAccepted":
      return `${notification.actorName} accepted your friend request`;
    case "clientStateChanged":
      if (notification.changedComponentCount > 1) {
        return `${notification.actorName} updated ${notification.changedComponentCount} component states in '${notification.projectName ?? "a project"}'`;
      }

      return `${notification.actorName} updated the '${notification.componentLabel ?? "component"}' state in '${notification.projectName ?? "a project"}'`;
    default:
      return "";
  }
}

export const NotificationsPageClient = () => {
  const router = useRouter();
  const notifications = useQuery(
    api.notifications.queries.listNotifications,
  ) as AppNotification[] | undefined;
  const hasUnreadNotifications = useQuery(
    api.notifications.queries.hasUnreadNotifications,
  );
  const markNotificationsSeen = useMutation(
    api.notifications.mutations.markNotificationsSeen,
  );
  const markNotificationRead = useMutation(
    api.notifications.mutations.markNotificationRead,
  );
  const { openConnectionsSection } = useSidebarController();
  const isMarkingSeenRef = useRef(false);

  useEffect(() => {
    if (
      notifications === undefined ||
      hasUnreadNotifications !== true ||
      isMarkingSeenRef.current
    ) {
      return;
    }

    isMarkingSeenRef.current = true;

    void markNotificationsSeen().finally(() => {
      isMarkingSeenRef.current = false;
    });
  }, [hasUnreadNotifications, markNotificationsSeen, notifications]);

  const handleNotificationClick = async (notification: AppNotification) => {
    await markNotificationRead({
      notificationId: notification.id,
    });

    if (notification.type === "clientStateChanged") {
      if (!notification.projectId) {
        return;
      }

      router.push(getProjectAnalyticsPath(String(notification.projectId)));
      return;
    }

    if (!notification.sidebarTarget) {
      return;
    }

    openConnectionsSection(notification.sidebarTarget);
  };

  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-3xl text-xl font-medium">Notifications</p>
      </div>
      <p className="text-(--gray-page)">
        See your latest invites, friend requests, user updates and more.
      </p>
      <div className="flex flex-col w-full">
        {notifications === undefined ? (
          <p className="text-(--gray-page)">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-(--gray-page)">No notifications yet.</p>
        ) : (
          notifications.map((notification, index) => (
            <button
              type="button"
              key={notification.id}
              className={`flex items-start justify-start text-left flex-col gap-1 p-2 w-full hover:bg-(--gray)/20 ${
                index === 0
                  ? "border-y border-(--gray)"
                  : "border-b border-(--gray)"
              }`}
              onClick={() => void handleNotificationClick(notification)}
            >
              <span className="text-(--gray-page)">
                {formatNotificationDate(notification.createdAt)}
              </span>
              <p className={notification.isRead ? "" : "font-medium"}>
                {getNotificationText(notification)}
              </p>
            </button>
          ))
        )}
      </div>
    </>
  );
};
