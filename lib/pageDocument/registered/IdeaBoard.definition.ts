import { defineRegisteredPageComponentDefinition } from "../registeredDefinitions";
import { isRecord } from "../utils";

function normalizeVotes(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value)].filter(
    (userId): userId is string =>
      typeof userId === "string" && userId.trim().length > 0,
  );
}

export const IdeaBoardDefinition = defineRegisteredPageComponentDefinition({
  type: "IdeaBoard",
  commands: ["ideaboard", "board"],
  createDefaultConfig: () => ({
    canClientAdd: true,
    canClientVote: true,
  }),
  createDefaultState: () => ({
    ideas: [] as Array<{
      id: string;
      idea: string;
      createdByUserId: string | null;
      votes: string[];
    }>,
  }),
  normalizeConfig: (value, fallback) => {
    if (typeof value === "object" && value !== null) {
      const config = value as Partial<typeof fallback>;

      return {
        canClientAdd:
          typeof config.canClientAdd === "boolean"
            ? config.canClientAdd
            : fallback.canClientAdd,
        canClientVote:
          typeof config.canClientVote === "boolean"
            ? config.canClientVote
            : fallback.canClientVote,
      };
    }

    return fallback;
  },
  normalizeState: (value, fallback) => {
    if (!isRecord(value) || !Array.isArray(value.ideas)) {
      return fallback;
    }

    return {
      ideas: value.ideas
        .map((idea, index) => {
          if (!isRecord(idea) || typeof idea.idea !== "string") {
            return null;
          }

          const nextIdea = idea.idea.trim();

          if (nextIdea.length === 0) {
            return null;
          }

          return {
            id:
              typeof idea.id === "string" && idea.id.trim().length > 0
                ? idea.id
                : `idea_${index + 1}`,
            idea: nextIdea,
            createdByUserId:
              typeof idea.createdByUserId === "string" &&
              idea.createdByUserId.trim().length > 0
                ? idea.createdByUserId
                : null,
            votes: normalizeVotes(idea.votes),
          };
        })
        .filter(
          (idea): idea is (typeof fallback.ideas)[number] => idea !== null,
        ),
    };
  },
  componentLibrary: {
    name: "Idea Board",
    description:
      "Add and vote on different ideas, which can be submitted by all project members. Commands: /ideaboard, /board",
    previewSrc: "/component-previews/idea-board.svg",
    tag: "input",
  },
});
