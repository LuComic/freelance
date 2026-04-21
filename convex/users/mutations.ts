import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { internalMutation, mutation } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { deleteGuestUser, isAnonymousUser } from "../lib/guests";
import { invalidState } from "../lib/errors";
import { assertMaxLength } from "../lib/inputValidation";
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
    const guestUserIds = new Set<Doc<"users">["_id"]>();

    const ownedProjects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (query) => query.eq("ownerId", userId))
      .collect();
    const deletedProjectIds = new Set<string>();

    for (const project of ownedProjects) {
      deletedProjectIds.add(project._id);
      const pages = await ctx.db
        .query("pages")
        .withIndex("by_project", (query) => query.eq("projectId", project._id))
        .collect();
      for (const page of pages) {
        await ctx.db.delete(page._id);
      }

      const members = await ctx.db
        .query("projectMembers")
        .withIndex("by_project", (query) => query.eq("projectId", project._id))
        .collect();
      for (const member of members) {
        const memberUser = await ctx.db.get(member.userId);

        if (
          memberUser &&
          memberUser._id !== userId &&
          isAnonymousUser(memberUser)
        ) {
          guestUserIds.add(memberUser._id);
        }
      }
      for (const member of members) {
        await ctx.db.delete(member._id);
      }

      const invites = await ctx.db
        .query("projectInvites")
        .withIndex("by_project", (query) => query.eq("projectId", project._id))
        .collect();
      for (const invite of invites) {
        await ctx.db.delete(invite._id);
      }

      await ctx.db.delete(project._id);
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

    const projectInvites = await ctx.db.query("projectInvites").collect();
    for (const invite of projectInvites) {
      if (
        invite.invitedByUserId === userId ||
        invite.invitedUserId === userId ||
        deletedProjectIds.has(invite.projectId)
      ) {
        await ctx.db.delete(invite._id);
      }
    }

    const guestProjectUpgrades = await ctx.db
      .query("guestProjectUpgrades")
      .collect();
    for (const guestProjectUpgrade of guestProjectUpgrades) {
      if (guestProjectUpgrade.guestUserId === userId) {
        await ctx.db.delete(guestProjectUpgrade._id);
      }
    }

    const connections = await ctx.db.query("connections").collect();
    for (const connection of connections) {
      if (
        connection.requesterUserId === userId ||
        connection.receiverUserId === userId
      ) {
        await ctx.db.delete(connection._id);
      }
    }

    const notifications = await ctx.db.query("notifications").collect();
    for (const notification of notifications) {
      if (
        notification.userId === userId ||
        notification.actorUserId === userId ||
        notification.connectionUserId === userId ||
        (notification.projectId !== undefined &&
          deletedProjectIds.has(notification.projectId))
      ) {
        await ctx.db.delete(notification._id);
      }
    }

    const projectActivityEntries = await ctx.db
      .query("projectActivity")
      .collect();
    for (const activityEntry of projectActivityEntries) {
      if (
        activityEntry.actorUserId === userId ||
        deletedProjectIds.has(activityEntry.projectId)
      ) {
        await ctx.db.delete(activityEntry._id);
      }
    }

    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (query) => query.eq("userId", userId))
      .collect();
    const sessionIds = new Set(sessions.map((session) => session._id));

    for (const session of sessions) {
      const refreshTokens = await ctx.db
        .query("authRefreshTokens")
        .withIndex("sessionId", (query) => query.eq("sessionId", session._id))
        .collect();

      for (const refreshToken of refreshTokens) {
        await ctx.db.delete(refreshToken._id);
      }
    }

    const authAccounts = await ctx.db.query("authAccounts").collect();
    const userAccounts = authAccounts.filter(
      (account) => account.userId === userId,
    );
    const accountIds = new Set(userAccounts.map((account) => account._id));

    if (accountIds.size > 0) {
      const verificationCodes = await ctx.db
        .query("authVerificationCodes")
        .collect();

      for (const verificationCode of verificationCodes) {
        if (accountIds.has(verificationCode.accountId)) {
          await ctx.db.delete(verificationCode._id);
        }
      }
    }

    const authVerifiers = await ctx.db.query("authVerifiers").collect();
    for (const verifier of authVerifiers) {
      if (verifier.sessionId && sessionIds.has(verifier.sessionId)) {
        await ctx.db.delete(verifier._id);
      }
    }

    for (const account of userAccounts) {
      await ctx.db.delete(account._id);
    }

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      if (user._id === userId) {
        continue;
      }

      const nextProjectIds = user.projectIds?.filter(
        (projectId) => !deletedProjectIds.has(projectId),
      );
      const patch: Partial<Doc<"users">> = {};

      if (
        user.projectIds &&
        nextProjectIds &&
        nextProjectIds.length !== user.projectIds.length
      ) {
        patch.projectIds =
          nextProjectIds.length > 0 ? nextProjectIds : undefined;
      }

      if (
        user.lastOpenedProjectId &&
        deletedProjectIds.has(user.lastOpenedProjectId)
      ) {
        patch.lastOpenedProjectId = undefined;
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(user._id, patch);
      }
    }

    for (const guestUserId of guestUserIds) {
      await deleteGuestUser(ctx, guestUserId);
    }

    await ctx.db.delete(userId);
  },
});
