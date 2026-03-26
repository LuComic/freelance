import type { Doc } from "../_generated/dataModel";
import { invalidState } from "./errors";
import {
  MAX_COMPONENTS_PER_PAGE,
  MAX_PAGE_CONTENT_BYTES,
  MAX_PAGES_PER_PROJECT,
  getUtf8ByteLength,
} from "../../lib/pageLimits";
import type { PageDocumentV1 } from "../../lib/pageDocument";

function toKilobytes(byteLength: number) {
  return Math.ceil(byteLength / 1024);
}

export function assertProjectCanAddPages(
  project: Pick<Doc<"projects">, "pageIds">,
  pagesToAdd = 1,
) {
  if (project.pageIds.length + pagesToAdd > MAX_PAGES_PER_PROJECT) {
    throw invalidState(
      `Projects are limited to ${MAX_PAGES_PER_PROJECT} pages.`,
    );
  }
}

export function serializePageDocumentWithLimits(document: PageDocumentV1) {
  const componentCount = Object.keys(document.components).length;

  if (componentCount > MAX_COMPONENTS_PER_PAGE) {
    throw invalidState(
      `This page has ${componentCount} components. Limit is ${MAX_COMPONENTS_PER_PAGE}.`,
    );
  }

  const contentJson = JSON.stringify(document);
  const contentByteLength = getUtf8ByteLength(contentJson);

  if (contentByteLength > MAX_PAGE_CONTENT_BYTES) {
    throw invalidState(
      `Page content is too large to save (${toKilobytes(contentByteLength)} KB). Limit is ${MAX_PAGE_CONTENT_BYTES / 1024} KB.`,
    );
  }

  return contentJson;
}
