import type { Doc } from "../_generated/dataModel";

export function buildUserSearchText(user: Pick<Doc<"users">, "name" | "bio">) {
  const searchParts = [user.name, user.bio]
    .map((value) => value?.trim().toLowerCase())
    .filter((value): value is string => Boolean(value));

  return searchParts.length > 0 ? searchParts.join(" ") : undefined;
}
