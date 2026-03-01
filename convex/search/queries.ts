import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { getConnectionByPairKey, toConnectionUserListItem } from "../connections/model";
import { requireCurrentAuth } from "../lib/auth";
import { APP_ERROR_CODES, ConvexDomainError } from "../lib/errors";
import { getOrderedProjectPages } from "../lib/projectRecords";

type ProjectSearchOrder = {
  projectId: Doc<"projects">["_id"];
  projectUpdatedAt: number;
};

type PageSearchCandidate = {
  projectId: Doc<"projects">["_id"];
  projectSlug: string;
  projectName: string;
  pageId: Doc<"pages">["_id"];
  pageSlug: string;
  pageTitle: string;
  pageDescription: string | null;
  projectUpdatedAt: number;
  pageUpdatedAt: number;
  normalizedProjectName: string;
  normalizedPageTitle: string;
};

type PageSearchResult = Omit<
  PageSearchCandidate,
  "normalizedProjectName" | "normalizedPageTitle"
>;

function normalizeSearchQuery(value: string) {
  return value.trim().toLowerCase();
}

function compareProjectsForSearch(
  lastOpenedProjectId: Doc<"users">["lastOpenedProjectId"],
  left: ProjectSearchOrder,
  right: ProjectSearchOrder,
) {
  if (lastOpenedProjectId) {
    if (
      left.projectId === lastOpenedProjectId &&
      right.projectId !== lastOpenedProjectId
    ) {
      return -1;
    }

    if (
      right.projectId === lastOpenedProjectId &&
      left.projectId !== lastOpenedProjectId
    ) {
      return 1;
    }
  }

  return right.projectUpdatedAt - left.projectUpdatedAt;
}

function getSearchRank(
  normalizedQuery: string,
  candidate: Pick<PageSearchCandidate, "normalizedPageTitle" | "normalizedProjectName">,
) {
  if (candidate.normalizedPageTitle === normalizedQuery) {
    return 0;
  }

  if (candidate.normalizedPageTitle.startsWith(normalizedQuery)) {
    return 1;
  }

  if (candidate.normalizedPageTitle.includes(normalizedQuery)) {
    return 2;
  }

  if (candidate.normalizedProjectName.startsWith(normalizedQuery)) {
    return 3;
  }

  if (candidate.normalizedProjectName.includes(normalizedQuery)) {
    return 4;
  }

  return null;
}

function compareCandidates(
  lastOpenedProjectId: Doc<"users">["lastOpenedProjectId"],
  left: PageSearchCandidate,
  right: PageSearchCandidate,
) {
  const byProject = compareProjectsForSearch(lastOpenedProjectId, left, right);
  if (byProject !== 0) {
    return byProject;
  }

  if (right.pageUpdatedAt !== left.pageUpdatedAt) {
    return right.pageUpdatedAt - left.pageUpdatedAt;
  }

  return left.pageTitle.localeCompare(right.pageTitle);
}

function toPageSearchResult(candidate: PageSearchCandidate): PageSearchResult {
  return {
    projectId: candidate.projectId,
    projectSlug: candidate.projectSlug,
    projectName: candidate.projectName,
    pageId: candidate.pageId,
    pageSlug: candidate.pageSlug,
    pageTitle: candidate.pageTitle,
    pageDescription: candidate.pageDescription,
    projectUpdatedAt: candidate.projectUpdatedAt,
    pageUpdatedAt: candidate.pageUpdatedAt,
  };
}

export const searchPagesAcrossProjects = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const { userId, user } = await requireCurrentAuth(ctx);
      const normalizedQuery = normalizeSearchQuery(args.query);
      const limit = Math.max(1, Math.floor(args.limit ?? 10));
      const memberships = await ctx.db
        .query("projectMembers")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      const activeMemberships = memberships.filter(
        (membership) => membership.status === "active",
      );
      const projects = await Promise.all(
        activeMemberships.map((membership) => ctx.db.get(membership.projectId)),
      );
      const visibleProjects = new Map<Doc<"projects">["_id"], Doc<"projects">>();

      for (const project of projects) {
        if (!project || project.isArchived === true) {
          continue;
        }

        visibleProjects.set(project._id, project);
      }

      const candidates = (
        await Promise.all(
          Array.from(visibleProjects.values()).map(async (project) => {
            const pages = await getOrderedProjectPages(ctx, project);
            const orderedPages = [...pages].sort(
              (left, right) => right.updatedAt - left.updatedAt,
            );

            return orderedPages.map((page) => ({
              projectId: project._id,
              projectSlug: project.slug,
              projectName: project.name,
              pageId: page._id,
              pageSlug: page.slug,
              pageTitle: page.title,
              pageDescription: page.description ?? null,
              projectUpdatedAt: project.updatedAt,
              pageUpdatedAt: page.updatedAt,
              normalizedProjectName: normalizeSearchQuery(project.name),
              normalizedPageTitle: normalizeSearchQuery(page.title),
            }));
          }),
        )
      ).flat();

      if (!normalizedQuery) {
        return candidates
          .sort((left, right) =>
            compareCandidates(user.lastOpenedProjectId, left, right),
          )
          .slice(0, limit)
          .map(toPageSearchResult);
      }

      return candidates
        .map((candidate) => ({
          candidate,
          rank: getSearchRank(normalizedQuery, candidate),
        }))
        .filter(
          (
            entry,
          ): entry is {
            candidate: PageSearchCandidate;
            rank: number;
          } => entry.rank !== null,
        )
        .sort((left, right) => {
          if (left.rank !== right.rank) {
            return left.rank - right.rank;
          }

          return compareCandidates(
            user.lastOpenedProjectId,
            left.candidate,
            right.candidate,
          );
        })
        .slice(0, limit)
        .map(({ candidate }) => toPageSearchResult(candidate));
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

export const searchPeople = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const { userId } = await requireCurrentAuth(ctx);
      const normalizedQuery = normalizeSearchQuery(args.query);

      if (normalizedQuery.length < 2) {
        return [];
      }

      const limit = Math.max(1, Math.floor(args.limit ?? 10));
      const searchResults = await ctx.db
        .query("users")
        .withSearchIndex("search_text", (query) =>
          query.search("searchText", normalizedQuery),
        )
        .take(Math.max(limit * 4, 20));
      const visibleResults = [];

      for (const result of searchResults) {
        if (result._id === userId) {
          continue;
        }

        const connection = await getConnectionByPairKey(ctx, userId, result._id);
        if (connection?.status === "blocked") {
          continue;
        }

        visibleResults.push(toConnectionUserListItem(result));

        if (visibleResults.length >= limit) {
          break;
        }
      }

      return visibleResults;
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
