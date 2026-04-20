import type { PageComponentLiveStateByType } from "@/lib/pageDocument";

export const MAX_IDEA_LENGTH = 400;

type IdeaBoardIdea =
  PageComponentLiveStateByType<"IdeaBoard">["state"]["ideas"][number];
type IdeaBoardUserId = string;

export function createIdeaId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `idea_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function createIdea(
  idea: string,
  currentUserId: IdeaBoardUserId | null,
): IdeaBoardIdea {
  return {
    id: createIdeaId(),
    idea,
    createdByUserId: currentUserId,
    votes: [],
  };
}

export function getIdeaVoteCount(idea: Pick<IdeaBoardIdea, "votes">) {
  return idea.votes.length;
}

export function getIdeaAuthorName(
  idea: Pick<IdeaBoardIdea, "createdByUserId">,
  authorNames: Record<string, string>,
) {
  if (idea.createdByUserId === null) {
    return "Unknown";
  }

  return authorNames[idea.createdByUserId] ?? "Unknown";
}

export function hasIdeaVoteFromUser(
  idea: Pick<IdeaBoardIdea, "votes">,
  currentUserId: IdeaBoardUserId | null,
) {
  return currentUserId !== null && idea.votes.includes(currentUserId);
}

export function toggleIdeaVote(
  idea: IdeaBoardIdea,
  currentUserId: IdeaBoardUserId | null,
): IdeaBoardIdea {
  if (currentUserId === null) {
    return idea;
  }

  return hasIdeaVoteFromUser(idea, currentUserId)
    ? {
        ...idea,
        votes: idea.votes.filter((userId) => userId !== currentUserId),
      }
    : {
        ...idea,
        votes: [...idea.votes, currentUserId],
      };
}

export function removeVotesByUsers(
  ideas: IdeaBoardIdea[],
  userIds: Iterable<IdeaBoardUserId>,
) {
  const removedUserIds = new Set(userIds);

  if (removedUserIds.size === 0) {
    return ideas;
  }

  return ideas.map((idea) => ({
    ...idea,
    votes: idea.votes.filter((userId) => !removedUserIds.has(userId)),
  }));
}

export function removeIdeasByUsers(
  ideas: IdeaBoardIdea[],
  userIds: Iterable<IdeaBoardUserId>,
) {
  const removedUserIds = new Set(userIds);

  if (removedUserIds.size === 0) {
    return ideas;
  }

  return ideas.filter(
    (idea) =>
      idea.createdByUserId === null ||
      !removedUserIds.has(idea.createdByUserId),
  );
}
