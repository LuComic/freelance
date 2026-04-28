import {
  MAX_DESCRIPTION_LENGTH,
  MAX_OPTION_LABEL_LENGTH,
  MAX_SHORT_TITLE_LENGTH,
  truncateInput,
} from "../../inputLimits";
import { defineRegisteredPageComponentDefinition } from "../registeredDefinitions";
import { isRecord } from "../utils";
import {
  ADVANCED_INPUT_COLOR_TYPES,
  ADVANCED_INPUT_FONTS,
  type AdvancedInputColorType,
  type AdvancedInputMode,
} from "../../../app/lib/components/page_components/advanced_input/AdvancedInput.shared";

export type AdvancedInputColorEntry = {
  id: string;
  name: string;
  type: AdvancedInputColorType;
};

export type AdvancedInputFontEntry = {
  id: string;
  fontId: string;
};

export type AdvancedInputConfig = {
  title: string;
  description: string;
  mode: AdvancedInputMode;
};

export type AdvancedInputState = {
  colors: AdvancedInputColorEntry[];
  fonts: AdvancedInputFontEntry[];
};

const ADVANCED_INPUT_MODES = ["colors", "fonts"] as const;
const ADVANCED_INPUT_FONT_IDS = new Set(
  ADVANCED_INPUT_FONTS.map((font) => font.id) as readonly string[],
);

function isAdvancedInputMode(value: unknown): value is AdvancedInputMode {
  return ADVANCED_INPUT_MODES.includes(value as AdvancedInputMode);
}

function normalizeColorType(value: unknown): AdvancedInputColorType {
  return ADVANCED_INPUT_COLOR_TYPES.includes(value as AdvancedInputColorType)
    ? (value as AdvancedInputColorType)
    : "other";
}

function normalizeColors(value: unknown): AdvancedInputColorEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((color, index) => {
      if (!isRecord(color) || typeof color.name !== "string") {
        return null;
      }

      const name = truncateInput(color.name.trim(), MAX_OPTION_LABEL_LENGTH);

      if (!name) {
        return null;
      }

      return {
        id:
          typeof color.id === "string" && color.id.trim()
            ? color.id.trim()
            : `color_${index + 1}`,
        name,
        type: normalizeColorType(color.type),
      };
    })
    .filter((color): color is AdvancedInputColorEntry => color !== null);
}

function normalizeFonts(value: unknown): AdvancedInputFontEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenFontIds = new Set<string>();

  return value
    .map((font, index) => {
      if (
        !isRecord(font) ||
        typeof font.fontId !== "string" ||
        !ADVANCED_INPUT_FONT_IDS.has(font.fontId) ||
        seenFontIds.has(font.fontId)
      ) {
        return null;
      }

      seenFontIds.add(font.fontId);

      return {
        id:
          typeof font.id === "string" && font.id.trim()
            ? font.id.trim()
            : `font_${index + 1}`,
        fontId: font.fontId,
      };
    })
    .filter((font): font is AdvancedInputFontEntry => font !== null);
}

export const AdvancedInputDefinition = defineRegisteredPageComponentDefinition({
  type: "AdvancedInput",
  commands: ["advancedinput", "advanced"],
  createDefaultConfig: (): AdvancedInputConfig => ({
    title: "",
    description: "",
    mode: "colors",
  }),
  createDefaultState: (): AdvancedInputState => ({
    colors: [],
    fonts: [],
  }),
  normalizeConfig: (value, fallback) => {
    if (!isRecord(value)) {
      return fallback;
    }

    return {
      title:
        typeof value.title === "string"
          ? truncateInput(value.title.trim(), MAX_SHORT_TITLE_LENGTH)
          : fallback.title,
      description:
        typeof value.description === "string"
          ? truncateInput(value.description.trim(), MAX_DESCRIPTION_LENGTH)
          : fallback.description,
      mode: isAdvancedInputMode(value.mode) ? value.mode : fallback.mode,
    };
  },
  normalizeState: (value, fallback) => {
    if (!isRecord(value)) {
      return fallback;
    }

    return {
      colors: normalizeColors(value.colors),
      fonts: normalizeFonts(value.fonts),
    };
  },
  componentLibrary: {
    name: "Advanced Input",
    description:
      "Collect specific client details like colors and fonts. Commands: /advancedinput, /advanced",
    previewSrc: "/component-previews/simple-input.svg",
    tag: "input",
    limited: true,
  },
});
