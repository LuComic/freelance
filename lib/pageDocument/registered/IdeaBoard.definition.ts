import { defineRegisteredPageComponentDefinition } from "../registeredDefinitions";

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
      votes: number;
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
    if (
      typeof value === "object" &&
      value !== null &&
      Array.isArray((value as { ideas?: unknown }).ideas)
    ) {
      return value as typeof fallback;
    }

    return fallback;
  },
  componentLibrary: {
    name: "Idea Board",
    description:
      "Add and vote on different ideas, which can be submitted by all project members. Commands: /ideaboard, /board",
    previewSrc: "/component-previews/text-field.svg",
    tag: "input",
  },
});
