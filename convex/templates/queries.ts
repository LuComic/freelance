import { v } from "convex/values";
import { query } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { requireCurrentAuth } from "../lib/auth";
import { APP_ERROR_CODES, ConvexDomainError } from "../lib/errors";
import { getOrderedProjectPages } from "../lib/projectRecords";
import { templateTypeValidator } from "../lib/validators";
import { parsePageDocument } from "../pages/content";
import { requireProjectEditor } from "../lib/permissions";
import { getOrderedComponentTypes } from "../../lib/templateBlueprint";
import { buildTemplateAuthorName } from "./model";

function normalizeSearchQuery(value: string) {
  return value.trim().toLowerCase();
}

function getTemplateSearchRank(
  normalizedQuery: string,
  candidate: {
    normalizedName: string;
    normalizedAuthor: string;
    normalizedDescription: string;
  },
) {
  if (candidate.normalizedName === normalizedQuery) {
    return 0;
  }

  if (candidate.normalizedName.startsWith(normalizedQuery)) {
    return 1;
  }

  if (candidate.normalizedName.includes(normalizedQuery)) {
    return 2;
  }

  if (candidate.normalizedAuthor.startsWith(normalizedQuery)) {
    return 3;
  }

  if (candidate.normalizedAuthor.includes(normalizedQuery)) {
    return 4;
  }

  if (candidate.normalizedDescription.includes(normalizedQuery)) {
    return 5;
  }

  return null;
}

function compareTemplates(
  viewerUserId: Id<"users">,
  left: {
    authorUserId: Id<"users">;
    updatedAt: number;
    name: string;
  },
  right: {
    authorUserId: Id<"users">;
    updatedAt: number;
    name: string;
  },
) {
  const leftIsOwned = left.authorUserId === viewerUserId;
  const rightIsOwned = right.authorUserId === viewerUserId;

  if (leftIsOwned !== rightIsOwned) {
    return leftIsOwned ? -1 : 1;
  }

  if (left.updatedAt !== right.updatedAt) {
    return right.updatedAt - left.updatedAt;
  }

  return left.name.localeCompare(right.name);
}

export const searchVisibleTemplates = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    types: v.optional(v.array(templateTypeValidator)),
  },
  handler: async (ctx, args) => {
    try {
      const { userId } = await requireCurrentAuth(ctx);
      const normalizedQuery = normalizeSearchQuery(args.query);
      const limit = Math.max(1, Math.floor(args.limit ?? 10));
      const typeFilter =
        args.types && args.types.length > 0 ? new Set(args.types) : null;
      const [publicTemplates, ownTemplates] = await Promise.all([
        ctx.db
          .query("templates")
          .withIndex("by_visibility", (query) =>
            query.eq("visibility", "public"),
          )
          .collect(),
        ctx.db
          .query("templates")
          .withIndex("by_author", (query) => query.eq("authorUserId", userId))
          .collect(),
      ]);
      const visibleTemplates = new Map<
        string,
        (typeof publicTemplates)[number]
      >();

      for (const template of [...publicTemplates, ...ownTemplates]) {
        if (template.isArchived === true) {
          continue;
        }

        if (!template.contentJson) {
          continue;
        }

        if (typeFilter && !typeFilter.has(template.type)) {
          continue;
        }

        visibleTemplates.set(template._id, template);
      }

      const authorIds = Array.from(
        new Set(
          Array.from(visibleTemplates.values()).map(
            (template) => template.authorUserId,
          ),
        ),
      );
      const authors = new Map(
        (
          await Promise.all(authorIds.map((authorId) => ctx.db.get(authorId)))
        ).flatMap((author) => (author ? [[author._id, author]] : [])),
      );
      const candidates = Array.from(visibleTemplates.values()).map(
        (template) => {
          const authorName = buildTemplateAuthorName(
            authors.get(template.authorUserId) ?? null,
          );

          return {
            id: template._id,
            name: template.name,
            description: template.description ?? null,
            templateType: template.type,
            author: authorName,
            authorUserId: template.authorUserId,
            updatedAt: template.updatedAt,
            normalizedName: normalizeSearchQuery(template.name),
            normalizedAuthor: normalizeSearchQuery(authorName),
            normalizedDescription: normalizeSearchQuery(
              template.description ?? "",
            ),
          };
        },
      );

      if (!normalizedQuery) {
        return candidates
          .sort((left, right) => compareTemplates(userId, left, right))
          .slice(0, limit)
          .map(
            ({
              id,
              name,
              description,
              templateType,
              author,
              authorUserId,
              updatedAt,
            }) => ({
              id,
              name,
              description,
              templateType,
              author,
              authorUserId,
              updatedAt,
            }),
          );
      }

      return candidates
        .map((candidate) => ({
          candidate,
          rank: getTemplateSearchRank(normalizedQuery, candidate),
        }))
        .filter(
          (
            entry,
          ): entry is {
            candidate: (typeof candidates)[number];
            rank: number;
          } => entry.rank !== null,
        )
        .sort((left, right) => {
          if (left.rank !== right.rank) {
            return left.rank - right.rank;
          }

          return compareTemplates(userId, left.candidate, right.candidate);
        })
        .slice(0, limit)
        .map(
          ({
            candidate: {
              id,
              name,
              description,
              templateType,
              author,
              authorUserId,
              updatedAt,
            },
          }) => ({
            id,
            name,
            description,
            templateType,
            author,
            authorUserId,
            updatedAt,
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

export const getProjectTemplateSource = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const project = await ctx.db.get(args.projectId);

    if (!project || project.isArchived === true) {
      return null;
    }

    await requireProjectEditor(ctx, project._id, userId);
    const pages = await getOrderedProjectPages(ctx, project);

    return {
      pages: pages.map((page) => ({
        id: page._id,
        title: page.title,
        components: getOrderedComponentTypes(
          parsePageDocument(page.contentJson),
        ),
      })),
    };
  },
});
