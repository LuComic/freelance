import { defineRegisteredPageComponentDefinition } from "../registeredDefinitions";

export const IdeaBoardDefinition = defineRegisteredPageComponentDefinition({
  type: "IdeaBoard",
  commands: ["ideaboard", "board"],
  createDefaultConfig: () => ({
    canClientEdit: true,
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
      return value as typeof fallback;
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
