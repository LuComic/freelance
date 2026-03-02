import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { buildUserDisplayName } from "../connections/model";
import { requireCurrentAuth } from "../lib/auth";
import {
  APP_ERROR_CODES,
  ConvexDomainError,
  invalidState,
  notFound,
  unauthorized,
} from "../lib/errors";
import { requireProjectEditor } from "../lib/permissions";
import { projectInviteRoleValidator } from "../lib/validators";
import {
  buildNotificationActorSnapshot,
  createNotification,
} from "../notifications/model";

type InviteableProject = Pick<Doc<"projects">, "_id" | "slug" | "name" | "createdAt">;
type InviteCtx = QueryCtx | MutationCtx;
type PendingSidebarProjectInvite = {
  inviteId: Id<"projectInvites">;
  projectId: Id<"projects">;
  projectSlug: string;
  projectName: string;
  role: Doc<"projectInvites">["role"];
  label: string;
  invitedByUserId: Id<"users">;
  invitedByName: string;
  image: string | null;
};

const REOPENABLE_INVITE_STATUSES = new Set<
  Doc<"projectInvites">["status"]
>(["declined", "revoked", "expired"]);

function compareInviteableProjects(
  projectOrder: Map<string, number>,
  left: InviteableProject,
  right: InviteableProject,
) {
  const leftOrder = projectOrder.get(left._id);
  const rightOrder = projectOrder.get(right._id);

  if (leftOrder !== undefined && rightOrder !== undefined) {
    return leftOrder - rightOrder;
  }

  if (leftOrder !== undefined) {
    return -1;
  }

  if (rightOrder !== undefined) {
    return 1;
  }

  if (left.createdAt !== right.createdAt) {
    return left.createdAt - right.createdAt;
  }

  return left.name.localeCompare(right.name);
}

function normalizeEmail(email: string | null | undefined) {
  const trimmedEmail = email?.trim().toLowerCase();
  return trimmedEmail ? trimmedEmail : null;
}

function formatInviteLabel(
  role: Doc<"projectInvites">["role"],
  projectName: string,
) {
  return `${role === "coCreator" ? "co-creator" : "client"}-${projectName}`;
}

function compareInvitesByRecency(
  left: Pick<Doc<"projectInvites">, "updatedAt" | "createdAt">,
  right: Pick<Doc<"projectInvites">, "updatedAt" | "createdAt">,
) {
  if (left.updatedAt !== right.updatedAt) {
    return right.updatedAt - left.updatedAt;
  }

  return right.createdAt - left.createdAt;
}

function inviteBelongsToUser(
  invite: Doc<"projectInvites">,
  userId: Id<"users">,
  userEmail?: string | null,
) {
  if (invite.invitedUserId) {
    return invite.invitedUserId === userId;
  }

  const normalizedUserEmail = normalizeEmail(userEmail);
  return (
    normalizedUserEmail !== null &&
    normalizeEmail(invite.email) === normalizedUserEmail
  );
}

async function listMatchingProjectInvites(
  ctx: InviteCtx,
  projectId: Id<"projects">,
  targetUserId: Id<"users">,
  targetEmail: string,
) {
  const normalizedTargetEmail = normalizeEmail(targetEmail);
  const invites = await ctx.db
    .query("projectInvites")
    .withIndex("by_project", (query) => query.eq("projectId", projectId))
    .collect();

  return invites.filter((invite) => {
    if (invite.invitedUserId === targetUserId) {
      return true;
    }

    return normalizeEmail(invite.email) === normalizedTargetEmail;
  });
}

async function requireProjectInviteRecipient(
  ctx: InviteCtx,
  inviteId: Id<"projectInvites">,
  currentUserId: Id<"users">,
  currentUserEmail?: string | null,
) {
  const invite = await ctx.db.get(inviteId);

  if (!invite) {
    throw notFound(`Project invite ${inviteId} was not found.`);
  }

  if (!inviteBelongsToUser(invite, currentUserId, currentUserEmail)) {
    throw unauthorized("This project invite does not belong to you.");
  }

  return invite;
}

export async function listIncomingPendingProjectInvitesForSidebar(
  ctx: InviteCtx,
  userId: Id<"users">,
  userEmail?: string | null,
): Promise<PendingSidebarProjectInvite[]> {
  const invites = await ctx.db.query("projectInvites").collect();
  const visibleInvites = invites
    .filter(
      (invite) =>
        invite.status === "pending" &&
        inviteBelongsToUser(invite, userId, userEmail),
    )
    .sort(compareInvitesByRecency);
  const items: PendingSidebarProjectInvite[] = [];

  for (const invite of visibleInvites) {
    const [project, invitedByUser, membership] = await Promise.all([
      ctx.db.get(invite.projectId),
      ctx.db.get(invite.invitedByUserId),
      ctx.db
        .query("projectMembers")
        .withIndex("by_project_user", (query) =>
          query.eq("projectId", invite.projectId).eq("userId", userId),
        )
        .unique(),
    ]);

    if (
      !project ||
      project.isArchived === true ||
      !invitedByUser ||
      membership?.status === "active"
    ) {
      continue;
    }

    items.push({
      inviteId: invite._id,
      projectId: project._id,
      projectSlug: project.slug,
      projectName: project.name,
      role: invite.role,
      label: formatInviteLabel(invite.role, project.name),
      invitedByUserId: invitedByUser._id,
      invitedByName: buildUserDisplayName(invitedByUser),
      image: invitedByUser.image ?? null,
    });
  }

  return items;
}

export const listInviteableProjects = query({
  args: {},
  handler: async (ctx) => {
    try {
      const { userId, user } = await requireCurrentAuth(ctx);
      const memberships = await ctx.db
        .query("projectMembers")
        .withIndex("by_user", (query) => query.eq("userId", userId))
        .collect();
      const editableMemberships = memberships.filter(
        (membership) =>
          membership.status === "active" &&
          (membership.role === "owner" || membership.role === "coCreator"),
      );
      const projects = await Promise.all(
        editableMemberships.map((membership) => ctx.db.get(membership.projectId)),
      );
      const visibleProjects = projects.filter(
        (project): project is NonNullable<typeof project> =>
          project !== null && project.isArchived !== true,
      );
      const projectOrder = new Map(
        (user.projectIds ?? []).map((projectId, index) => [projectId, index]),
      );

      return visibleProjects
        .sort((left, right) => compareInviteableProjects(projectOrder, left, right))
        .map((project) => ({
          id: project._id,
          slug: project.slug,
          name: project.name,
        }));
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

export const inviteUserToProject = mutation({
  args: {
    projectId: v.id("projects"),
    targetUserId: v.id("users"),
    role: projectInviteRoleValidator,
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireCurrentAuth(ctx);

    if (args.targetUserId === userId) {
      throw invalidState("You can't invite yourself to a project.");
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
    const targetEmail = normalizeEmail(targetUser.email);

    if (!targetEmail) {
      throw invalidState(
        "This account cannot receive a project invite because it has no email address yet.",
      );
    }

    const existingMembership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (query) =>
        query.eq("projectId", project._id).eq("userId", args.targetUserId),
      )
      .unique();

    if (existingMembership?.status === "active") {
      throw invalidState("This user is already a member of this project.");
    }

    const matchingInvites = await listMatchingProjectInvites(
      ctx,
      project._id,
      args.targetUserId,
      targetEmail,
    );
    const pendingInvite = matchingInvites.find(
      (invite) => invite.status === "pending",
    );

    if (pendingInvite) {
      throw invalidState("This user already has a pending invite for this project.");
    }

    const reopenableInvite = matchingInvites
      .filter((invite) => REOPENABLE_INVITE_STATUSES.has(invite.status))
      .sort(compareInvitesByRecency)[0];
    const now = Date.now();

    if (reopenableInvite) {
      await ctx.db.patch(reopenableInvite._id, {
        role: args.role,
        status: "pending",
        invitedByUserId: userId,
        invitedUserId: args.targetUserId,
        email: targetEmail,
        updatedAt: now,
      });

      await createNotification(ctx, {
        userId: args.targetUserId,
        type: "projectInviteReceived",
        ...buildNotificationActorSnapshot(user),
        projectId: project._id,
        projectSlugSnapshot: project.slug,
        projectNameSnapshot: project.name,
        inviteId: reopenableInvite._id,
        sidebarTarget: "invites",
      });
    } else {
      const inviteId = await ctx.db.insert("projectInvites", {
        projectId: project._id,
        invitedByUserId: userId,
        invitedUserId: args.targetUserId,
        email: targetEmail,
        role: args.role,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      });

      await createNotification(ctx, {
        userId: args.targetUserId,
        type: "projectInviteReceived",
        ...buildNotificationActorSnapshot(user),
        projectId: project._id,
        projectSlugSnapshot: project.slug,
        projectNameSnapshot: project.name,
        inviteId,
        sidebarTarget: "invites",
      });
    }

    return {
      projectId: project._id,
      targetUserId: args.targetUserId,
      role: args.role,
      status: "pending" as const,
    };
  },
});

export const acceptProjectInvite = mutation({
  args: {
    inviteId: v.id("projectInvites"),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireCurrentAuth(ctx);
    const invite = await requireProjectInviteRecipient(
      ctx,
      args.inviteId,
      userId,
      user.email,
    );

    if (invite.status !== "pending") {
      throw invalidState("This project invite is no longer pending.");
    }

    const now = Date.now();
    const project = await ctx.db.get(invite.projectId);

    if (!project || project.isArchived === true) {
      await ctx.db.patch(invite._id, {
        status: "expired",
        updatedAt: now,
      });
      throw invalidState("This project is no longer available.");
    }

    const existingMembership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (query) =>
        query.eq("projectId", project._id).eq("userId", userId),
      )
      .unique();

    if (!existingMembership) {
      await ctx.db.insert("projectMembers", {
        projectId: project._id,
        userId,
        role: invite.role,
        status: "active",
        addedByUserId: invite.invitedByUserId,
        createdAt: now,
        updatedAt: now,
      });
    } else if (existingMembership.status === "removed") {
      await ctx.db.patch(existingMembership._id, {
        role: invite.role,
        status: "active",
        addedByUserId: invite.invitedByUserId,
        updatedAt: now,
      });
    }

    if (!user.projectIds?.includes(project._id)) {
      await ctx.db.patch(user._id, {
        projectIds: [...(user.projectIds ?? []), project._id],
      });
    }

    await ctx.db.patch(invite._id, {
      status: "accepted",
      updatedAt: now,
    });

    return {
      inviteId: invite._id,
      projectId: project._id,
      projectSlug: project.slug,
      role: invite.role,
      status: "accepted" as const,
    };
  },
});

export const declineProjectInvite = mutation({
  args: {
    inviteId: v.id("projectInvites"),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireCurrentAuth(ctx);
    const invite = await requireProjectInviteRecipient(
      ctx,
      args.inviteId,
      userId,
      user.email,
    );

    if (invite.status !== "pending") {
      throw invalidState("This project invite is no longer pending.");
    }

    await ctx.db.patch(invite._id, {
      status: "declined",
      updatedAt: Date.now(),
    });

    return {
      inviteId: invite._id,
      status: "declined" as const,
    };
  },
});
