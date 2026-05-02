export const MAX_OWNED_PROJECTS_PER_USER = 10;
export const MAX_PAGES_PER_PROJECT = 15;
export const MAX_COMPONENTS_PER_PAGE = 100;
export const PAGE_CONTENT_WARNING_BYTES = 150 * 1024;
export const MAX_PAGE_CONTENT_BYTES = 250 * 1024;

const textEncoder = new TextEncoder();

export function getUtf8ByteLength(value: string) {
  return textEncoder.encode(value).length;
}
