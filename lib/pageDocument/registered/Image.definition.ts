import { defineRegisteredPageComponentDefinition } from "../registeredDefinitions";
import { isRecord } from "../utils";

const MAX_IMAGE_DIMENSION = 2400;
const MAX_ALT_TEXT_LENGTH = 300;

function normalizeDimension(value: unknown, fallback: number | null) {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(MAX_IMAGE_DIMENSION, Math.max(1, Math.floor(value)));
}

export const ImageDefinition = defineRegisteredPageComponentDefinition({
  type: "Image",
  commands: ["image"],
  createDefaultConfig: () => ({
    storageId: null as string | null,
    widthPx: 640 as number | null,
    heightPx: null as number | null,
    altText: "",
  }),
  createDefaultState: () => ({}),
  normalizeConfig: (value, fallback) => {
    if (!isRecord(value)) return fallback;

    return {
      storageId: typeof value.storageId === "string" ? value.storageId : null,
      widthPx: normalizeDimension(value.widthPx, fallback.widthPx),
      heightPx: normalizeDimension(value.heightPx, fallback.heightPx),
      altText:
        typeof value.altText === "string"
          ? value.altText.slice(0, MAX_ALT_TEXT_LENGTH)
          : fallback.altText,
    };
  },
  normalizeState: (value, fallback) => (isRecord(value) ? fallback : fallback),
  componentLibrary: {
    name: "Image",
    description: "Upload and display a page image. Command: /image",
    previewSrc: "/component-previews/text-field.svg",
    tag: "text",
    limited: false,
  },
});
