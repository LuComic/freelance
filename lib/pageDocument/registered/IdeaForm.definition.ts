import { defineRegisteredPageComponentDefinition } from "../registeredDefinitions";

export const IdeaFormDefinition = defineRegisteredPageComponentDefinition({
  type: "IdeaForm",
  commands: ["ideaform", "ideas"],
  createDefaultConfig: () => ({}),
  createDefaultState: () => ({
    ideas: [] as Array<{
      id: string;
      text: string;
      color: "" | "red" | "blue";
    }>,
  }),
  normalizeConfig: (_value, fallback) => fallback,
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
    name: "Idea Form",
    description:
      "Collect simple ideas with an optional color. Commands: /ideaform, /ideas",
    previewSrc: "/component-previews/text-field.svg",
    tag: "input",
    limited: true,
  },
});
