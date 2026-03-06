import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { buildUserDisplayName } from "../connections/model";
import { invalidState } from "../lib/errors";

type ProjectCtx = QueryCtx | MutationCtx;

const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const JOIN_CODE_LENGTH = 8;

export function normalizeJoinCode(value: string) {
  return value
    .trim()
    .replace(/[\s-]+/g, "")
    .toUpperCase();
}

export async function getProjectByNormalizedJoinCode(
  ctx: ProjectCtx,
  joinCode: string,
) {
  const matches = await ctx.db
    .query("projects")
    .withIndex("by_join_code", (query) => query.eq("joinCode", joinCode))
    .collect();
  const visibleMatches = matches.filter(
    (project) => project.isArchived !== true,
  );

  if (visibleMatches.length > 1) {
    throw invalidState("Project join code data is inconsistent.");
  }

  return visibleMatches[0] ?? null;
}

function createRandomJoinCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(JOIN_CODE_LENGTH));

  return Array.from(
    bytes,
    (byte) => JOIN_CODE_ALPHABET[byte % JOIN_CODE_ALPHABET.length],
  ).join("");
}

export async function generateUniqueJoinCode(
  ctx: ProjectCtx,
  currentProjectId?: Id<"projects">,
): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const joinCode = createRandomJoinCode();
    const existingProject = await getProjectByNormalizedJoinCode(ctx, joinCode);

    if (!existingProject || existingProject._id === currentProjectId) {
      return joinCode;
    }
  }

  throw invalidState("Could not generate a unique join code.");
}

export function buildProjectMemberDisplayName(
  user: Pick<Doc<"users">, "_id" | "name" | "email">,
  membership?: Pick<Doc<"projectMembers">, "formerName"> | null,
) {
  const currentName = buildUserDisplayName(user);
  const formerName = membership?.formerName?.trim();

  if (!formerName || formerName === currentName) {
    return currentName;
  }

  return `${currentName}, formerly known as ${formerName}`;
}
