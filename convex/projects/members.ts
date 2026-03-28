import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { mutation, query } from "../_generated/server";
import {
  compareConnectionUserListItems,
  getOtherUserId,
  toConnectionUserListItem,
  type ConnectionUserListItem,
} from "../connections/model";
import { requireCurrentAuth } from "../lib/auth";
import { deleteGuestUser, isAnonymousUser } from "../lib/guests";
import {
  APP_ERROR_CODES,
  ConvexDomainError,
  invalidState,
  notFound,
} from "../lib/errors";
import { requireProjectEditor, requireProjectMember } from "../lib/permissions";
import { projectInviteRoleValidator } from "../lib/validators";
import { buildProjectMemberDisplayName } from "./model";

type ProjectCtx = QueryCtx | MutationCtx;

async function listActiveProjectMembers(
  ctx: ProjectCtx,
  projectId: Id<"projects">,
) {
  const memberships = await ctx.db
    .query("projectMembers")
    .withIndex("by_project", (query) => query.eq("projectId", projectId))
    .collect();

  return memberships.filter((membership) => membership.status === "active");
}

async function listBlockedUserIds(ctx: ProjectCtx, currentUserId: Id<"users">) {
  const [requestedConnections, receivedConnections] = await Promise.all([
    ctx.db
      .query("connections")
      .withIndex("by_requester", (query) =>
        query.eq("requesterUserId", currentUserId),
      )
      .collect(),
    ctx.db
      .query("connections")
      .withIndex("by_receiver", (query) =>
        query.eq("receiverUserId", currentUserId),
      )
      .collect(),
  ]);

  return new Set(
    [...requestedConnections, ...receivedConnections]
      .filter((connection) => connection.status === "blocked")
      .map((connection) => getOtherUserId(connection, currentUserId)),
  );
}

async function listHiddenCollaboratorIds(
  ctx: ProjectCtx,
  currentUserId: Id<"users">,
) {
  const [requestedConnections, receivedConnections] = await Promise.all([
    ctx.db
      .query("connections")
      .withIndex("by_requester", (query) =>
        query.eq("requesterUserId", currentUserId),
      )
      .collect(),
    ctx.db
      .query("connections")
      .withIndex("by_receiver", (query) =>
        query.eq("receiverUserId", currentUserId),
      )
      .collect(),
  ]);

  return new Set(
    [...requestedConnections, ...receivedConnections]
      .filter((connection) =>
        connection.hiddenByUserIds?.includes(currentUserId),
      )
      .map((connection) => getOtherUserId(connection, currentUserId)),
  );
}

async function getSortedMemberItemsByRole(
  ctx: ProjectCtx,
  projectId: Id<"projects">,
) {
  const memberships = await listActiveProjectMembers(ctx, projectId);
  const users = await Promise.all(
    memberships.map((membership) => ctx.db.get(membership.userId)),
  );
  const userById = new Map(
    users
      .filter((user): user is NonNullable<typeof user> => user !== null)
      .map((user) => [user._id, user]),
  );
  const clients: ConnectionUserListItem[] = [];
  const coCreators: ConnectionUserListItem[] = [];
  const members: ConnectionUserListItem[] = [];

  for (const membership of memberships) {
    const user = userById.get(membership.userId);
    if (!user) {
      continue;
    }

    const item = {
      ...toConnectionUserListItem(user),
      name: buildProjectMemberDisplayName(user, membership),
    };

    members.push(item);

    if (membership.role === "client") {
      clients.push(item);
      continue;
    }

    if (membership.role === "coCreator") {
      coCreators.push(item);
    }
  }

  return {
    clients: clients.sort(compareConnectionUserListItems),
    coCreators: coCreators.sort(compareConnectionUserListItems),
    members: members.sort(compareConnectionUserListItems),
  };
}

export async function listHistoricalCollaborators(
  ctx: ProjectCtx,
  currentUserId: Id<"users">,
) {
  const currentUser = await ctx.db.get(currentUserId);

  if (!currentUser || isAnonymousUser(currentUser)) {
    return [];
  }

  const currentMemberships = await ctx.db
    .query("projectMembers")
    .withIndex("by_user", (query) => query.eq("userId", currentUserId))
    .collect();

  if (currentMemberships.length === 0) {
    return [];
  }

  const blockedUserIds = await listBlockedUserIds(ctx, currentUserId);
  const hiddenCollaboratorIds = await listHiddenCollaboratorIds(
    ctx,
    currentUserId,
  );
  const projectIds = Array.from(
    new Set(currentMemberships.map((membership) => membership.projectId)),
  );
  const collaboratorIds = new Set<Id<"users">>();
  const membershipGroups = await Promise.all(
    projectIds.map((projectId) =>
      ctx.db
        .query("projectMembers")
        .withIndex("by_project", (query) => query.eq("projectId", projectId))
        .collect(),
    ),
  );

  for (const memberships of membershipGroups) {
    for (const membership of memberships) {
      if (membership.userId === currentUserId) {
        continue;
      }

      if (blockedUserIds.has(membership.userId)) {
        continue;
      }

      if (hiddenCollaboratorIds.has(membership.userId)) {
        continue;
      }

      collaboratorIds.add(membership.userId);
    }
  }

  const collaborators = await Promise.all(
    Array.from(collaboratorIds).map((userId) => ctx.db.get(userId)),
  );

  return collaborators
    .filter(
      (user): user is NonNullable<typeof user> =>
        user !== null && user.isAnonymous !== true,
    )
    .map((user) => toConnectionUserListItem(user))
    .sort(compareConnectionUserListItems);
}

export const getProjectMembers = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    try {
      const { userId } = await requireCurrentAuth(ctx);
      const viewerMembership = await requireProjectMember(
        ctx,
        args.projectId,
        userId,
      );
      const membersByRole = await getSortedMemberItemsByRole(
        ctx,
        args.projectId,
      );

      return {
        projectId: args.projectId,
        viewerRole: viewerMembership.role,
        clients: membersByRole.clients,
        coCreators: membersByRole.coCreators,
        members: membersByRole.members,
      };
    } catch (error) {
      if (
        error instanceof ConvexDomainError &&
        (error.code === APP_ERROR_CODES.notFound ||
          error.code === APP_ERROR_CODES.unauthorized)
      ) {
        return null;
      }

      throw error;
    }
  },
});

export const getProjectMembershipForUser = query({
  args: {
    projectId: v.id("projects"),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const project = await ctx.db.get(args.projectId);

    if (!project || project.isArchived === true) {
      throw notFound(`Project ${args.projectId} was not found.`);
    }

    await requireProjectEditor(ctx, project._id, userId);

    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (query) =>
        query.eq("projectId", project._id).eq("userId", args.targetUserId),
      )
      .unique();

    if (!membership || membership.status !== "active") {
      return null;
    }

    return {
      role: membership.role,
    };
  },
});

export const removeProjectMember = mutation({
  args: {
    projectId: v.id("projects"),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);

    if (args.targetUserId === userId) {
      throw invalidState("You can't remove yourself from this project.");
    }

    const [project, targetUser] = await Promise.all([
      ctx.db.get(args.projectId),
      ctx.db.get(args.targetUserId),
    ]);

    if (!project || project.isArchived === true) {
      throw notFound(`Project ${args.projectId} was not found.`);
    }

    if (!targetUser) {
      throw notFound(`User ${args.targetUserId} was not found.`);
    }

    const viewerMembership = await requireProjectEditor(
      ctx,
      project._id,
      userId,
    );

    if (viewerMembership.role !== "owner") {
      throw invalidState("Only the project owner can remove members.");
    }

    const targetMembership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (query) =>
        query.eq("projectId", project._id).eq("userId", args.targetUserId),
      )
      .unique();

    if (!targetMembership || targetMembership.status !== "active") {
      throw invalidState("This user is not an active project member.");
    }

    if (targetMembership.role === "owner") {
      throw invalidState("The project owner cannot be removed.");
    }

    if (isAnonymousUser(targetUser)) {
      await deleteGuestUser(ctx, targetUser._id);
      return {
        projectId: project._id,
        targetUserId: args.targetUserId,
      };
    }

    const now = Date.now();

    await ctx.db.patch(targetMembership._id, {
      status: "removed",
      updatedAt: now,
    });

    const nextProjectIds = targetUser.projectIds?.filter(
      (projectId) => projectId !== project._id,
    );
    const patch: Partial<Doc<"users">> = {};

    if (
      targetUser.projectIds &&
      nextProjectIds &&
      nextProjectIds.length !== targetUser.projectIds.length
    ) {
      patch.projectIds = nextProjectIds.length > 0 ? nextProjectIds : undefined;
    }

    if (targetUser.lastOpenedProjectId === project._id) {
      patch.lastOpenedProjectId = undefined;
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(targetUser._id, patch);
    }

    return {
      projectId: project._id,
      targetUserId: args.targetUserId,
    };
  },
});

export const changeProjectMemberRole = mutation({
  args: {
    projectId: v.id("projects"),
    targetUserId: v.id("users"),
    role: projectInviteRoleValidator,
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);

    if (args.targetUserId === userId) {
      throw invalidState("You can't change your own role in this project.");
    }

    const [project, targetUser] = await Promise.all([
      ctx.db.get(args.projectId),
      ctx.db.get(args.targetUserId),
    ]);

    if (!project || project.isArchived === true) {
      throw notFound(`Project ${args.projectId} was not found.`);
    }

    if (!targetUser) {
      throw notFound(`User ${args.targetUserId} was not found.`);
    }

    await requireProjectEditor(ctx, project._id, userId);

    const targetMembership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (query) =>
        query.eq("projectId", project._id).eq("userId", args.targetUserId),
      )
      .unique();

    if (!targetMembership || targetMembership.status !== "active") {
      throw invalidState("This user is not an active project member.");
    }

    if (targetMembership.role === "owner") {
      throw invalidState("The project owner's role cannot be changed.");
    }

    if (targetMembership.role === args.role) {
      throw invalidState("This user already has that role in this project.");
    }

    await ctx.db.patch(targetMembership._id, {
      role: args.role,
      updatedAt: Date.now(),
    });

    return {
      projectId: project._id,
      targetUserId: args.targetUserId,
      role: args.role,
    };
  },
});
