export const MAX_PAGES_PER_PROJECT = 25;
export const MAX_COMPONENTS_PER_PAGE = 150;
export const PAGE_CONTENT_WARNING_BYTES = 200 * 1024;
export const MAX_PAGE_CONTENT_BYTES = 350 * 1024;

const textEncoder = new TextEncoder();

export function getUtf8ByteLength(value: string) {
  return textEncoder.encode(value).length;
}
