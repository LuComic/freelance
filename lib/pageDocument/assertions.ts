import type { PageDocumentV1 } from "./types";
import { isPageComponentType } from "./types";
import { isRecord } from "./utils";

export function assertPageConfigDocumentV1(
  value: unknown,
): asserts value is PageDocumentV1 {
  if (!isRecord(value) || value.version !== 1) {
    throw new Error("Page document must be version 1.");
  }

  if (typeof value.editorText !== "string" || !isRecord(value.components)) {
    throw new Error("Page document shape is invalid.");
  }

  for (const [id, instance] of Object.entries(value.components)) {
    if (!isRecord(instance) || typeof id !== "string") {
      throw new Error("Page component instance is invalid.");
    }
    if (
      typeof instance.id !== "string" ||
      instance.id !== id ||
      typeof instance.type !== "string" ||
      !isPageComponentType(instance.type) ||
      !isRecord(instance.config) ||
      !isRecord(instance.state)
    ) {
      throw new Error("Page component document shape is invalid.");
    }
  }
}

export const assertPageDocumentV1: (
  value: unknown,
) => asserts value is PageDocumentV1 = assertPageConfigDocumentV1;
