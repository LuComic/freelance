import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { unauthorized } from "../lib/errors";
import { markAllNotificationsReadForUser } from "./model";

export const markAllNotificationsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireCurrentAuth(ctx);
    const updatedCount = await markAllNotificationsReadForUser(ctx, userId);

    return {
      updatedCount,
    };
  },
});

export const markNotificationsSeen = mutation({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireCurrentAuth(ctx);
    const notificationsLastSeenAt = Date.now();

    await ctx.db.patch(user._id, {
      notificationsLastSeenAt,
    });

    return {
      notificationsLastSeenAt,
    };
  },
});

export const markNotificationRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const notification = await ctx.db.get(args.notificationId);

    if (!notification) {
      return {
        wasUpdated: false,
      };
    }

    if (notification.userId !== userId) {
      throw unauthorized("This notification does not belong to you.");
    }

    if (notification.isRead) {
      return {
        wasUpdated: false,
      };
    }

    const now = Date.now();

    await ctx.db.patch(notification._id, {
      isRead: true,
      readAt: now,
      updatedAt: now,
    });

    return {
      wasUpdated: true,
    };
  },
});
