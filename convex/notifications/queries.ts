import { query } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { APP_ERROR_CODES, ConvexDomainError } from "../lib/errors";

export const hasUnreadNotifications = query({
  args: {},
  handler: async (ctx) => {
    try {
      const { userId, user } = await requireCurrentAuth(ctx);
      const notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user", (query) => query.eq("userId", userId))
        .collect();
      const notificationsLastSeenAt = user.notificationsLastSeenAt ?? 0;

      return notifications.some(
        (notification) => notification.createdAt > notificationsLastSeenAt,
      );
    } catch (error) {
      if (
        error instanceof ConvexDomainError &&
        (error.code === APP_ERROR_CODES.notFound ||
          error.code === APP_ERROR_CODES.unauthorized)
      ) {
        return false;
      }

      throw error;
    }
  },
});

export const listNotifications = query({
  args: {},
  handler: async (ctx) => {
    try {
      const { userId } = await requireCurrentAuth(ctx);
      const notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user", (query) => query.eq("userId", userId))
        .collect();

      const sortedNotifications = notifications.sort(
        (left, right) => right.createdAt - left.createdAt,
      );

      return Promise.all(
        sortedNotifications.map(async (notification) => {
          const project = notification.projectId
            ? await ctx.db.get(notification.projectId)
            : null;
          const projectName =
            project && project.isArchived !== true
              ? project.name
              : (notification.projectNameSnapshot ?? null);

          if (notification.type === "clientStateChanged") {
            return {
              id: notification._id,
              type: notification.type,
              isRead: notification.isRead,
              createdAt: notification.createdAt,
              actorName: notification.actorNameSnapshot,
              actorImage: notification.actorImageSnapshot ?? null,
              projectId: notification.projectId ?? null,
              projectName,
              pageTitle: notification.pageTitleSnapshot ?? null,
              componentLabel: notification.componentLabelSnapshot ?? null,
              changedComponentCount: notification.changedComponentCount ?? 1,
            };
          }

          return {
            id: notification._id,
            type: notification.type,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            actorName: notification.actorNameSnapshot,
            actorImage: notification.actorImageSnapshot ?? null,
            projectName,
            sidebarTarget: notification.sidebarTarget ?? null,
          };
        }),
      );
    } catch (error) {
      if (
        error instanceof ConvexDomainError &&
        (error.code === APP_ERROR_CODES.notFound ||
          error.code === APP_ERROR_CODES.unauthorized)
      ) {
        return [];
      }

      throw error;
    }
  },
});
