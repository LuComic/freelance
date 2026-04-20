import { defineRegisteredPageComponentDefinition } from "../registeredDefinitions";
import { isRecord } from "../utils";
import { MAX_FORM_TEXT_ANSWER_LENGTH, truncateInput } from "../../inputLimits";

export const SimpleInputDefinition = defineRegisteredPageComponentDefinition({
  type: "SimpleInput",
  commands: ["input", "simpleinput"],
  createDefaultConfig: () => ({}),
  createDefaultState: () => ({
    inputs: [] as Array<{
      id: string;
      value: string;
    }>,
  }),
  normalizeConfig: (value, fallback) => {
    if (typeof value === "object" && value !== null) {
      return value as typeof fallback;
    }

    return fallback;
  },
  normalizeState: (value, fallback) => {
    if (!isRecord(value) || !Array.isArray(value.inputs)) {
      return fallback;
    }

    return {
      inputs: value.inputs
        .map((input, index) => {
          if (!isRecord(input) || typeof input.value !== "string") {
            return null;
          }

          const nextValue = truncateInput(
            input.value.trim(),
            MAX_FORM_TEXT_ANSWER_LENGTH,
          );

          if (nextValue.length === 0) {
            return null;
          }

          return {
            id:
              typeof input.id === "string" && input.id.trim().length > 0
                ? input.id
                : `input_${index + 1}`,
            value: nextValue,
          };
        })
        .filter(
          (input): input is (typeof fallback.inputs)[number] => input !== null,
        ),
    };
  },
  componentLibrary: {
    name: "Simple Input",
    description:
      "A simple input field for client-written responses. Commands: /input, /simpleinput",
    previewSrc: "/component-previews/simple-input.svg",
    tag: "input",
    limited: true,
  },
});
