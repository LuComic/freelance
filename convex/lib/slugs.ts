const NON_ALPHANUMERIC_REGEX = /[^a-z0-9]+/g;
const EDGE_DASHES_REGEX = /^-+|-+$/g;

export function slugifyLabel(value: string, fallback = "untitled-page") {
  const normalized = value.trim().toLowerCase();
  const slug = normalized
    .replace(NON_ALPHANUMERIC_REGEX, "-")
    .replace(EDGE_DASHES_REGEX, "");

  return slug || fallback;
}

export function uniqueSlugFromLabel(
  value: string,
  existingSlugs: Iterable<string>,
  fallback = "untitled-page",
) {
  return ensureUniqueSlug(slugifyLabel(value, fallback), existingSlugs, fallback);
}

export function slugifyTitle(title: string) {
  return slugifyLabel(title, "untitled-page");
}

export function ensureUniqueSlug(
  baseSlug: string,
  existingSlugs: Iterable<string>,
  fallback = "untitled-page",
) {
  const normalizedBaseSlug = slugifyLabel(baseSlug, fallback);
  const slugSet = new Set(existingSlugs);

  if (!slugSet.has(normalizedBaseSlug)) {
    return normalizedBaseSlug;
  }

  let counter = 2;
  while (slugSet.has(`${normalizedBaseSlug}-${counter}`)) {
    counter += 1;
  }

  return `${normalizedBaseSlug}-${counter}`;
}

export function slugFromTitle(title: string, existingSlugs: Iterable<string> = []) {
  return ensureUniqueSlug(slugifyTitle(title), existingSlugs, "untitled-page");
}
