import type { Doc, Id, TableNames } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

type DeletedProjectIds = Set<Id<"projects"> | string>;
type DeletableDoc = { _id: Id<TableNames> };

async function deleteUniqueDocs(ctx: MutationCtx, docs: DeletableDoc[]) {
  const seenIds = new Set<string>();

  for (const doc of docs) {
    if (seenIds.has(doc._id)) {
      continue;
    }

    seenIds.add(doc._id);
    await ctx.db.delete(doc._id);
  }
}

async function deleteProjectInvitesForProjects(
  ctx: MutationCtx,
  projectIds: DeletedProjectIds,
) {
  const inviteGroups = await Promise.all(
    Array.from(projectIds).map((projectId) =>
      ctx.db
        .query("projectInvites")
        .withIndex("by_project", (query) =>
          query.eq("projectId", projectId as Id<"projects">),
        )
        .collect(),
    ),
  );

  await deleteUniqueDocs(ctx, inviteGroups.flat());
}

export async function deleteUserInvites(
  ctx: MutationCtx,
  userId: Id<"users">,
  deletedProjectIds: DeletedProjectIds = new Set(),
) {
  const [sentInvites, receivedInvites] = await Promise.all([
    ctx.db
      .query("projectInvites")
      .withIndex("by_invited_by", (query) =>
        query.eq("invitedByUserId", userId),
      )
      .collect(),
    ctx.db
      .query("projectInvites")
      .withIndex("by_invited_user", (query) =>
        query.eq("invitedUserId", userId),
      )
      .collect(),
  ]);

  await deleteUniqueDocs(ctx, [...sentInvites, ...receivedInvites]);

  if (deletedProjectIds.size > 0) {
    await deleteProjectInvitesForProjects(ctx, deletedProjectIds);
  }
}

export async function deleteUserConnections(
  ctx: MutationCtx,
  userId: Id<"users">,
) {
  const [requestedConnections, receivedConnections] = await Promise.all([
    ctx.db
      .query("connections")
      .withIndex("by_requester", (query) => query.eq("requesterUserId", userId))
      .collect(),
    ctx.db
      .query("connections")
      .withIndex("by_receiver", (query) => query.eq("receiverUserId", userId))
      .collect(),
  ]);

  await deleteUniqueDocs(ctx, [
    ...requestedConnections,
    ...receivedConnections,
  ]);
}

async function deleteProjectNotifications(
  ctx: MutationCtx,
  projectIds: DeletedProjectIds,
) {
  const notificationGroups = await Promise.all(
    Array.from(projectIds).map((projectId) =>
      ctx.db
        .query("notifications")
        .withIndex("by_project", (query) =>
          query.eq("projectId", projectId as Id<"projects">),
        )
        .collect(),
    ),
  );

  await deleteUniqueDocs(ctx, notificationGroups.flat());
}

export async function deleteUserNotifications(
  ctx: MutationCtx,
  userId: Id<"users">,
  deletedProjectIds: DeletedProjectIds = new Set(),
) {
  const [ownNotifications, actorNotifications, connectionNotifications] =
    await Promise.all([
      ctx.db
        .query("notifications")
        .withIndex("by_user", (query) => query.eq("userId", userId))
        .collect(),
      ctx.db
        .query("notifications")
        .withIndex("by_actor", (query) => query.eq("actorUserId", userId))
        .collect(),
      ctx.db
        .query("notifications")
        .withIndex("by_connection_user", (query) =>
          query.eq("connectionUserId", userId),
        )
        .collect(),
    ]);

  await deleteUniqueDocs(ctx, [
    ...ownNotifications,
    ...actorNotifications,
    ...connectionNotifications,
  ]);

  if (deletedProjectIds.size > 0) {
    await deleteProjectNotifications(ctx, deletedProjectIds);
  }
}

async function deleteProjectActivityForProjects(
  ctx: MutationCtx,
  projectIds: DeletedProjectIds,
) {
  const activityGroups = await Promise.all(
    Array.from(projectIds).map((projectId) =>
      ctx.db
        .query("projectActivity")
        .withIndex("by_project_created", (query) =>
          query.eq("projectId", projectId as Id<"projects">),
        )
        .collect(),
    ),
  );

  await deleteUniqueDocs(ctx, activityGroups.flat());
}

export async function deleteUserActivity(
  ctx: MutationCtx,
  userId: Id<"users">,
  deletedProjectIds: DeletedProjectIds = new Set(),
) {
  const authoredActivity = await ctx.db
    .query("projectActivity")
    .withIndex("by_actor", (query) => query.eq("actorUserId", userId))
    .collect();

  await deleteUniqueDocs(ctx, authoredActivity);

  if (deletedProjectIds.size > 0) {
    await deleteProjectActivityForProjects(ctx, deletedProjectIds);
  }
}

export async function deleteUserFormSubmissions(
  ctx: MutationCtx,
  userId: Id<"users">,
) {
  const submissions = await ctx.db
    .query("formSubmissions")
    .withIndex("by_submitter", (query) => query.eq("submittedByUserId", userId))
    .collect();

  await deleteUniqueDocs(ctx, submissions);
}

async function deleteProjectChatMessages(
  ctx: MutationCtx,
  projectIds: DeletedProjectIds,
) {
  const chatMessageGroups = await Promise.all(
    Array.from(projectIds).map((projectId) =>
      ctx.db
        .query("projectChatMessages")
        .withIndex("by_project_created", (query) =>
          query.eq("projectId", projectId as Id<"projects">),
        )
        .collect(),
    ),
  );

  await deleteUniqueDocs(ctx, chatMessageGroups.flat());
}

export async function deleteAuthDataForUser(
  ctx: MutationCtx,
  userId: Id<"users">,
) {
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

    await deleteUniqueDocs(ctx, refreshTokens);
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

    await deleteUniqueDocs(
      ctx,
      verificationCodes.filter((code) => accountIds.has(code.accountId)),
    );
  }

  const authVerifiers = await ctx.db.query("authVerifiers").collect();

  await deleteUniqueDocs(
    ctx,
    authVerifiers.filter(
      (verifier) => verifier.sessionId && sessionIds.has(verifier.sessionId),
    ),
  );
  await deleteUniqueDocs(ctx, userAccounts);
  await deleteUniqueDocs(ctx, sessions);
}

export async function removeDeletedProjectsFromUsers(
  ctx: MutationCtx,
  deletedProjectIds: DeletedProjectIds,
  deletingUserId?: Id<"users">,
) {
  if (deletedProjectIds.size === 0) {
    return;
  }

  const users = await ctx.db.query("users").collect();

  for (const user of users) {
    if (deletingUserId && user._id === deletingUserId) {
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
      patch.projectIds = nextProjectIds.length > 0 ? nextProjectIds : undefined;
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
}

export async function deleteOwnedProjectCascade(
  ctx: MutationCtx,
  project: Doc<"projects">,
  deletingUserId: Id<"users">,
) {
  const projectIdSet = new Set<Id<"projects"> | string>([project._id]);
  const guestUserIds = new Set<Id<"users">>();
  const [pages, members, guestUpgrades, formSubmissions] = await Promise.all([
    ctx.db
      .query("pages")
      .withIndex("by_project", (query) => query.eq("projectId", project._id))
      .collect(),
    ctx.db
      .query("projectMembers")
      .withIndex("by_project", (query) => query.eq("projectId", project._id))
      .collect(),
    ctx.db
      .query("guestProjectUpgrades")
      .withIndex("by_project", (query) => query.eq("projectId", project._id))
      .collect(),
    ctx.db
      .query("formSubmissions")
      .withIndex("by_project", (query) => query.eq("projectId", project._id))
      .collect(),
  ]);

  for (const member of members) {
    const memberUser = await ctx.db.get(member.userId);

    if (
      memberUser &&
      memberUser._id !== deletingUserId &&
      memberUser.isAnonymous === true
    ) {
      guestUserIds.add(memberUser._id);
    }
  }

  await deleteUniqueDocs(ctx, pages);
  await deleteUniqueDocs(ctx, members);
  await deleteProjectInvitesForProjects(ctx, projectIdSet);
  await deleteUniqueDocs(ctx, guestUpgrades);
  await deleteProjectActivityForProjects(ctx, projectIdSet);
  await deleteProjectChatMessages(ctx, projectIdSet);
  await deleteProjectNotifications(ctx, projectIdSet);
  await deleteUniqueDocs(ctx, formSubmissions);
  await ctx.db.delete(project._id);

  return guestUserIds;
}

export async function deleteGuestUserData(
  ctx: MutationCtx,
  guestUserId: Id<"users">,
) {
  const [memberships, upgradeTokens, authoredChatMessages] = await Promise.all([
    ctx.db
      .query("projectMembers")
      .withIndex("by_user", (query) => query.eq("userId", guestUserId))
      .collect(),
    ctx.db
      .query("guestProjectUpgrades")
      .withIndex("by_guest_user", (query) =>
        query.eq("guestUserId", guestUserId),
      )
      .collect(),
    ctx.db
      .query("projectChatMessages")
      .withIndex("by_author", (query) => query.eq("authorUserId", guestUserId))
      .collect(),
  ]);

  await deleteUniqueDocs(ctx, memberships);
  await deleteUniqueDocs(ctx, upgradeTokens);
  await deleteUserNotifications(ctx, guestUserId);
  await deleteUserActivity(ctx, guestUserId);
  await deleteUserInvites(ctx, guestUserId);
  await deleteUserConnections(ctx, guestUserId);
  await deleteUserFormSubmissions(ctx, guestUserId);
  await deleteUniqueDocs(ctx, authoredChatMessages);
  await deleteAuthDataForUser(ctx, guestUserId);
  await ctx.db.delete(guestUserId);
}
