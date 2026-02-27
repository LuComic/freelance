const NON_ALPHANUMERIC_REGEX = /[^a-z0-9]+/g;
const EDGE_DASHES_REGEX = /^-+|-+$/g;

export function slugifyTitle(title: string) {
  const normalized = title.trim().toLowerCase();
  const slug = normalized
    .replace(NON_ALPHANUMERIC_REGEX, "-")
    .replace(EDGE_DASHES_REGEX, "");

  return slug || "untitled-page";
}

export function ensureUniqueSlug(baseSlug: string, existingSlugs: Iterable<string>) {
  const normalizedBaseSlug = slugifyTitle(baseSlug);
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
  return ensureUniqueSlug(slugifyTitle(title), existingSlugs);
}
