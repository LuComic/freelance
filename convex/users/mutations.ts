import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { internalMutation, mutation } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { invalidState } from "../lib/errors";
import { assertMaxLength } from "../lib/inputValidation";
import {
  deleteAuthDataForUser,
  deleteOwnedProjectCascade,
  deleteGuestUserData,
  deleteUserActivity,
  deleteUserConnections,
  deleteUserFormSubmissions,
  deleteUserInvites,
  deleteUserNotifications,
  removeDeletedProjectsFromUsers,
} from "../lib/userCleanup";
import { buildUserSearchText } from "./model";
import { MAX_BIO_LENGTH, MAX_NAME_LENGTH } from "../../lib/inputLimits";

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireCurrentAuth(ctx);
    const nextName =
      args.name !== undefined ? args.name.trim() : (user.name ?? undefined);
    const nextBio =
      args.bio !== undefined
        ? args.bio.trim() || undefined
        : (user.bio ?? undefined);

    if (args.name === undefined && args.bio === undefined) {
      throw invalidState("At least one profile field must be provided.");
    }

    const patch: Partial<Doc<"users">> = {};

    if (args.name !== undefined) {
      if (!nextName) {
        throw invalidState("Name cannot be empty.");
      }
      assertMaxLength(nextName, MAX_NAME_LENGTH, "Name");

      if (user.name !== nextName) {
        patch.name = nextName;
      }
    }

    if (args.bio !== undefined) {
      if (nextBio) {
        assertMaxLength(nextBio, MAX_BIO_LENGTH, "Bio");
      }

      if (user.bio !== nextBio) {
        patch.bio = nextBio;
      }
    }

    if (Object.keys(patch).length > 0) {
      patch.searchText = buildUserSearchText({
        name: nextName,
        bio: nextBio,
      });
      await ctx.db.patch(userId, patch);
    }
  },
});

export const backfillUserSearchText = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let updatedCount = 0;

    for (const user of users) {
      const searchText = buildUserSearchText(user);
      if (user.searchText === searchText) {
        continue;
      }

      await ctx.db.patch(user._id, { searchText });
      updatedCount += 1;
    }

    return { updatedCount };
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireCurrentAuth(ctx);
    const ownedProjects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (query) => query.eq("ownerId", userId))
      .collect();
    const deletedProjectIds = new Set<string>();
    const guestUserIds = new Set<Id<"users">>();

    for (const project of ownedProjects) {
      deletedProjectIds.add(project._id);
      const projectGuestUserIds = await deleteOwnedProjectCascade(
        ctx,
        project,
        userId,
      );

      for (const guestUserId of projectGuestUserIds) {
        guestUserIds.add(guestUserId);
      }
    }

    const authoredTemplates = await ctx.db
      .query("templates")
      .withIndex("by_author", (query) => query.eq("authorUserId", userId))
      .collect();
    for (const template of authoredTemplates) {
      await ctx.db.delete(template._id);
    }

    const projectMemberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (query) => query.eq("userId", userId))
      .collect();
    for (const membership of projectMemberships) {
      await ctx.db.delete(membership._id);
    }

    await deleteUserInvites(ctx, userId, deletedProjectIds);

    const guestProjectUpgrades = await ctx.db
      .query("guestProjectUpgrades")
      .withIndex("by_guest_user", (query) => query.eq("guestUserId", userId))
      .collect();
    for (const guestProjectUpgrade of guestProjectUpgrades) {
      await ctx.db.delete(guestProjectUpgrade._id);
    }

    await deleteUserConnections(ctx, userId);
    await deleteUserNotifications(ctx, userId, deletedProjectIds);
    await deleteUserActivity(ctx, userId, deletedProjectIds);
    await deleteUserFormSubmissions(ctx, userId);
    const projectChatMessages = await ctx.db
      .query("projectChatMessages")
      .withIndex("by_author", (query) => query.eq("authorUserId", userId))
      .collect();
    for (const message of projectChatMessages) {
      await ctx.db.delete(message._id);
    }

    await deleteAuthDataForUser(ctx, userId);
    await removeDeletedProjectsFromUsers(ctx, deletedProjectIds, userId);

    for (const guestUserId of guestUserIds) {
      await deleteGuestUserData(ctx, guestUserId);
    }

    await ctx.db.delete(userId);
  },
});
