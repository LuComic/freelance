export const BETA_ALLOWLIST_EMAILS = [
  // Add approved beta emails here.
  // "name@example.com",
  "lukasjaager@gmail.com",
  "lukasjaager2@gmail.com",
  "veiko@jaager.net",
];

const normalizedAllowlist = new Set(
  BETA_ALLOWLIST_EMAILS.map((email) => normalizeBetaEmail(email)).filter(
    (email): email is string => email !== null,
  ),
);

export function normalizeBetaEmail(email: string | null | undefined) {
  if (typeof email !== "string") {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  return normalizedEmail.length > 0 ? normalizedEmail : null;
}

export function isBetaAllowlistedEmail(email: string | null | undefined) {
  const normalizedEmail = normalizeBetaEmail(email);
  return normalizedEmail !== null && normalizedAllowlist.has(normalizedEmail);
}
