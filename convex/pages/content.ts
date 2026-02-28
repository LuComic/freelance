import {
  createInitialPageDocument,
  normalizePageDocument,
  type PageDocumentV1,
} from "../../lib/pageDocument";

export function createInitialPage() {
  return createInitialPageDocument();
}

export function parsePageDocument(
  contentJson?: string | null,
) {
  if (!contentJson) {
    return createInitialPageDocument();
  }

  return normalizePageDocument(JSON.parse(contentJson));
}

export function serializePageDocument(document: PageDocumentV1) {
  return JSON.stringify(document);
}

export const createInitialPageConfig = createInitialPage;
export const parsePageConfigDocument = parsePageDocument;
export const serializePageConfigDocument = serializePageDocument;
