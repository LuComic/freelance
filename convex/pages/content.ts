import {
  createInitialPageConfigDocument,
  createInitialPageLiveDocument,
  normalizePageConfigDocument,
  normalizePageLiveDocument,
  type PageConfigDocumentV1,
  type PageLiveDocumentV1,
} from "../../lib/pageDocument";

export function createInitialPageConfig() {
  return createInitialPageConfigDocument();
}

export function createInitialPageLive() {
  return createInitialPageLiveDocument();
}

export function parsePageConfigDocument(contentJson?: string | null) {
  if (!contentJson) {
    return createInitialPageConfigDocument();
  }

  return normalizePageConfigDocument(JSON.parse(contentJson));
}

export function parsePageLiveDocument(
  liveContentJson: string | null | undefined,
  configDocument?: PageConfigDocumentV1,
) {
  if (!liveContentJson) {
    return normalizePageLiveDocument(
      createInitialPageLiveDocument(),
      configDocument ?? createInitialPageConfigDocument(),
    );
  }

  return normalizePageLiveDocument(
    JSON.parse(liveContentJson),
    configDocument ?? createInitialPageConfigDocument(),
  );
}

export function serializePageConfigDocument(
  document: PageConfigDocumentV1,
) {
  return JSON.stringify(document);
}

export function serializePageLiveDocument(
  document: PageLiveDocumentV1,
) {
  return JSON.stringify(document);
}
