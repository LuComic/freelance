import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { internalMutation, mutation, query } from "../_generated/server";
import { buildUserDisplayName } from "../connections/model";
import { requireCurrentAuth } from "../lib/auth";
import {
  assertNonAnonymousUser,
  deleteGuestUser,
  isAnonymousUser,
} from "../lib/guests";
import {
  APP_ERROR_CODES,
  ConvexDomainError,
  invalidState,
  notFound,
} from "../lib/errors";
import { requireProjectEditor } from "../lib/permissions";
import { getOrderedProjectPages } from "../lib/projectRecords";
import { createProjectJoinNotifications } from "../notifications/model";
import {
  generateUniqueJoinCode,
  getProjectByNormalizedJoinCode,
  normalizeJoinCode,
} from "./model";

type RedirectProject = Pick<Doc<"projects">, "_id" | "pageIds" | "isArchived">;
type RedirectCtx = QueryCtx | MutationCtx;

function resolveTransferredRole(
  existingRole: Doc<"projectMembers">["role"],
  guestRole: Doc<"projectMembers">["role"],
) {
  if (existingRole === "owner" || existingRole === "coCreator") {
    return existingRole;
  }

  return guestRole;
}

async function getDefaultProjectPath(
  ctx: RedirectCtx,
  project: RedirectProject,
) {
  const pages = await getOrderedProjectPages(ctx, project as Doc<"projects">);

  return pages[0]
    ? `/projects/${project._id}/${pages[0]._id}`
    : `/projects/${project._id}`;
}

async function resolvePreferredProjectPath(
  ctx: RedirectCtx,
  project: RedirectProject,
  preferredPath: string,
) {
  const trimmedPreferredPath = preferredPath.trim();
  const defaultPath = await getDefaultProjectPath(ctx, project);

  if (!trimmedPreferredPath) {
    return defaultPath;
  }

  if (trimmedPreferredPath === "/projects") {
    return trimmedPreferredPath;
  }

  const projectPrefix = `/projects/${project._id}`;

  if (!trimmedPreferredPath.startsWith(projectPrefix)) {
    return defaultPath;
  }

  const pathname = trimmedPreferredPath.split(/[?#]/, 1)[0];

  if (
    pathname === projectPrefix ||
    pathname === `${projectPrefix}/settings` ||
    pathname === `${projectPrefix}/analytics`
  ) {
    return trimmedPreferredPath;
  }

  const segments = pathname.split("/").filter(Boolean);
  const pageId = segments[2];

  if (!pageId || pageId === "settings" || pageId === "analytics") {
    return defaultPath;
  }

  const page = await ctx.db.get(pageId as Id<"pages">);

  return page && page.isArchived !== true && page.projectId === project._id
    ? trimmedPreferredPath
    : defaultPath;
}

export const validateJoinCode = query({
  args: {
    joinCode: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedJoinCode = normalizeJoinCode(args.joinCode);

    if (!normalizedJoinCode) {
      return null;
    }

    const project = await getProjectByNormalizedJoinCode(
      ctx,
      normalizedJoinCode,
    );

    if (!project) {
      return null;
    }

    const pages = await getOrderedProjectPages(ctx, project);

    return {
      joinCode: normalizedJoinCode,
      projectId: project._id,
      projectName: project.name,
      firstPageId: pages[0]?._id ?? null,
      redirectPath: pages[0]
        ? `/projects/${project._id}/${pages[0]._id}`
        : `/projects/${project._id}`,
    };
  },
});

export const getProjectJoinCode = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    try {
      const { userId } = await requireCurrentAuth(ctx);
      const project = await ctx.db.get(args.projectId);

      if (!project || project.isArchived === true) {
        throw notFound(`Project ${args.projectId} was not found.`);
      }

      await requireProjectEditor(ctx, project._id, userId);

      return {
        joinCode: project.joinCode ?? null,
        canRegenerate: true,
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

export const ensureProjectJoinCode = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const project = await ctx.db.get(args.projectId);

    if (!project || project.isArchived === true) {
      throw notFound(`Project ${args.projectId} was not found.`);
    }

    await requireProjectEditor(ctx, project._id, userId);
    let joinCode = project.joinCode ?? null;

    if (!joinCode) {
      joinCode = await generateUniqueJoinCode(ctx, project._id);
      await ctx.db.patch(project._id, {
        joinCode,
        updatedAt: Date.now(),
      });
    }

    return {
      joinCode,
      canRegenerate: true,
    };
  },
});

export const regenerateProjectJoinCode = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const project = await ctx.db.get(args.projectId);

    if (!project || project.isArchived === true) {
      throw notFound(`Project ${args.projectId} was not found.`);
    }

    await requireProjectEditor(ctx, project._id, userId);
    const joinCode = await generateUniqueJoinCode(ctx, project._id);

    await ctx.db.patch(project._id, {
      joinCode,
      updatedAt: Date.now(),
    });

    return {
      joinCode,
    };
  },
});

export const createGuestMembershipFromJoin = internalMutation({
  args: {
    userId: v.id("users"),
    joinCode: v.string(),
  },
  handler: async (ctx, args) => {
    const guestUser = await ctx.db.get(args.userId);

    if (!guestUser || guestUser.isAnonymous !== true) {
      throw invalidState("Guest join account was not created correctly.");
    }

    const activeMemberships = (
      await ctx.db
        .query("projectMembers")
        .withIndex("by_user", (query) => query.eq("userId", args.userId))
        .collect()
    ).filter((membership) => membership.status === "active");

    if (activeMemberships.length > 0) {
      throw invalidState("This guest account is already tied to a project.");
    }

    const normalizedJoinCode = normalizeJoinCode(args.joinCode);
    const project = await getProjectByNormalizedJoinCode(
      ctx,
      normalizedJoinCode,
    );

    if (!project) {
      throw invalidState("That project code is no longer valid.");
    }

    const now = Date.now();

    await ctx.db.insert("projectMembers", {
      projectId: project._id,
      userId: guestUser._id,
      role: "client",
      status: "active",
      addedByUserId: project.ownerId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(guestUser._id, {
      projectIds: [project._id],
      lastOpenedProjectId: project._id,
    });

    await createProjectJoinNotifications(ctx, {
      project,
      joinedUser: guestUser,
    });

    const redirectPath = await getDefaultProjectPath(ctx, project);

    return {
      projectId: project._id,
      redirectPath,
    };
  },
});

export const joinCurrentUserByCode = mutation({
  args: {
    joinCode: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireCurrentAuth(ctx);
    assertNonAnonymousUser(
      user,
      "Guest accounts are already tied to a project.",
    );

    const normalizedJoinCode = normalizeJoinCode(args.joinCode);

    if (!normalizedJoinCode) {
      throw invalidState("Enter a valid project code.");
    }

    const project = await getProjectByNormalizedJoinCode(
      ctx,
      normalizedJoinCode,
    );

    if (!project || project.isArchived === true) {
      throw invalidState("That project code is not valid.");
    }

    const existingMembership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (query) =>
        query.eq("projectId", project._id).eq("userId", userId),
      )
      .unique();
    const now = Date.now();
    let didJoinProject = false;

    if (!existingMembership) {
      await ctx.db.insert("projectMembers", {
        projectId: project._id,
        userId,
        role: "client",
        status: "active",
        addedByUserId: project.ownerId,
        createdAt: now,
        updatedAt: now,
      });
      didJoinProject = true;
    } else if (existingMembership.status === "removed") {
      await ctx.db.patch(existingMembership._id, {
        role: "client",
        status: "active",
        addedByUserId: project.ownerId,
        updatedAt: now,
      });
      didJoinProject = true;
    }

    const nextProjectIds = user.projectIds?.includes(project._id)
      ? (user.projectIds ?? [])
      : [...(user.projectIds ?? []), project._id];

    await ctx.db.patch(userId, {
      projectIds: nextProjectIds,
      lastOpenedProjectId: project._id,
    });

    if (didJoinProject) {
      await createProjectJoinNotifications(ctx, {
        project,
        joinedUser: user,
      });
    }

    return {
      projectId: project._id,
      redirectPath: await getDefaultProjectPath(ctx, project),
    };
  },
});

export const deleteGuestAfterFailedJoin = internalMutation({
  args: {
    guestUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await deleteGuestUser(ctx, args.guestUserId);
  },
});

export const prepareGuestUpgrade = mutation({
  args: {
    preferredPath: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireCurrentAuth(ctx);

    if (!isAnonymousUser(user)) {
      throw invalidState("Only guest accounts can be upgraded from here.");
    }

    const activeMemberships = (
      await ctx.db
        .query("projectMembers")
        .withIndex("by_user", (query) => query.eq("userId", userId))
        .collect()
    ).filter((membership) => membership.status === "active");

    if (activeMemberships.length !== 1) {
      throw invalidState(
        "This guest account is not tied to a single active project.",
      );
    }

    const [membership] = activeMemberships;

    if (membership.role !== "client") {
      throw invalidState("Only guest client accounts can be upgraded.");
    }

    const project = await ctx.db.get(membership.projectId);

    if (!project || project.isArchived === true) {
      throw invalidState("This project is no longer available.");
    }

    const existingTokens = await ctx.db
      .query("guestProjectUpgrades")
      .withIndex("by_guest_user", (query) => query.eq("guestUserId", userId))
      .collect();

    for (const token of existingTokens) {
      await ctx.db.delete(token._id);
    }

    const now = Date.now();
    const token = crypto.randomUUID().replace(/-/g, "");

    await ctx.db.insert("guestProjectUpgrades", {
      token,
      guestUserId: userId,
      projectId: membership.projectId,
      preferredPath: args.preferredPath.trim(),
      formerName: buildUserDisplayName(user),
      expiresAt: now + 1000 * 60 * 15,
      createdAt: now,
      updatedAt: now,
    });

    return {
      token,
    };
  },
});

export const completeGuestUpgrade = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireCurrentAuth(ctx);
    assertNonAnonymousUser(
      user,
      "Guest accounts must finish signing in before linking projects.",
    );
    const upgradeMatches = await ctx.db
      .query("guestProjectUpgrades")
      .withIndex("by_token", (query) => query.eq("token", args.token))
      .collect();

    if (upgradeMatches.length === 0) {
      throw invalidState("This guest upgrade request is no longer valid.");
    }

    if (upgradeMatches.length > 1) {
      throw invalidState("Guest upgrade data is inconsistent.");
    }

    const [upgrade] = upgradeMatches;

    if (upgrade.consumedAt) {
      throw invalidState("This guest upgrade request was already used.");
    }

    if (upgrade.expiresAt < Date.now()) {
      await ctx.db.patch(upgrade._id, {
        consumedAt: Date.now(),
        updatedAt: Date.now(),
      });
      throw invalidState(
        "This guest upgrade request expired. Please try again.",
      );
    }

    const isInPlaceUpgrade = upgrade.guestUserId === userId;
    const [project, guestUser] = await Promise.all([
      ctx.db.get(upgrade.projectId),
      ctx.db.get(upgrade.guestUserId),
    ]);

    if (!project || project.isArchived === true) {
      await ctx.db.patch(upgrade._id, {
        consumedAt: Date.now(),
        updatedAt: Date.now(),
      });
      await deleteGuestUser(ctx, upgrade.guestUserId);
      throw invalidState("This project is no longer available.");
    }

    if (!guestUser) {
      await ctx.db.patch(upgrade._id, {
        consumedAt: Date.now(),
        updatedAt: Date.now(),
      });
      throw invalidState("This guest account is no longer available.");
    }

    if (!isInPlaceUpgrade && guestUser.isAnonymous !== true) {
      await ctx.db.patch(upgrade._id, {
        consumedAt: Date.now(),
        updatedAt: Date.now(),
      });
      throw invalidState("This guest account is no longer available.");
    }

    const [guestMembership, existingMembership] = await Promise.all([
      ctx.db
        .query("projectMembers")
        .withIndex("by_project_user", (query) =>
          query.eq("projectId", project._id).eq("userId", guestUser._id),
        )
        .unique(),
      ctx.db
        .query("projectMembers")
        .withIndex("by_project_user", (query) =>
          query.eq("projectId", project._id).eq("userId", userId),
        )
        .unique(),
    ]);

    if (!guestMembership || guestMembership.status !== "active") {
      await ctx.db.patch(upgrade._id, {
        consumedAt: Date.now(),
        updatedAt: Date.now(),
      });
      await deleteGuestUser(ctx, guestUser._id);
      throw invalidState(
        "This guest account is no longer an active project client.",
      );
    }

    const formerName =
      upgrade.formerName.trim() || buildUserDisplayName(guestUser);
    const now = Date.now();

    if (isInPlaceUpgrade) {
      if (!guestMembership.formerName) {
        await ctx.db.patch(guestMembership._id, {
          formerName,
          updatedAt: now,
        });
      }
    } else if (!existingMembership) {
      await ctx.db.insert("projectMembers", {
        projectId: project._id,
        userId,
        role: guestMembership.role,
        status: "active",
        addedByUserId: guestMembership.addedByUserId,
        formerName,
        createdAt: now,
        updatedAt: now,
      });
    } else if (existingMembership.status === "removed") {
      await ctx.db.patch(existingMembership._id, {
        role: resolveTransferredRole(
          existingMembership.role,
          guestMembership.role,
        ),
        status: "active",
        addedByUserId:
          existingMembership.addedByUserId ?? guestMembership.addedByUserId,
        formerName: existingMembership.formerName ?? formerName,
        updatedAt: now,
      });
    }

    const nextProjectIds = Array.from(
      new Set([...(user.projectIds ?? []), project._id]),
    );

    await ctx.db.patch(userId, {
      projectIds: nextProjectIds,
      lastOpenedProjectId: project._id,
    });

    const redirectPath = await resolvePreferredProjectPath(
      ctx,
      project,
      upgrade.preferredPath,
    );

    await ctx.db.patch(upgrade._id, {
      consumedAt: now,
      updatedAt: now,
    });

    if (!isInPlaceUpgrade) {
      await deleteGuestUser(ctx, guestUser._id);
    }

    return {
      projectId: project._id,
      redirectPath,
    };
  },
});
