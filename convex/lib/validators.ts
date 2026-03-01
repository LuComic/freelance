import { v } from "convex/values";

export const CONNECTION_STATUSES = [
  "pending",
  "accepted",
  "declined",
  "canceled",
  "blocked",
  "removed",
] as const;

export const TEMPLATE_TYPES = ["project", "page"] as const;
export const TEMPLATE_VISIBILITIES = ["private", "public"] as const;
export const PROJECT_MEMBER_ROLES = ["owner", "coCreator", "client"] as const;
export const PROJECT_MEMBER_STATUSES = ["active", "removed"] as const;
export const PROJECT_INVITE_ROLES = ["coCreator", "client"] as const;
export const PROJECT_INVITE_STATUSES = [
  "pending",
  "accepted",
  "revoked",
  "expired",
  "declined",
] as const;

export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];
export type TemplateType = (typeof TEMPLATE_TYPES)[number];
export type TemplateVisibility = (typeof TEMPLATE_VISIBILITIES)[number];
export type ProjectMemberRole = (typeof PROJECT_MEMBER_ROLES)[number];
export type ProjectMemberStatus = (typeof PROJECT_MEMBER_STATUSES)[number];
export type ProjectInviteRole = (typeof PROJECT_INVITE_ROLES)[number];
export type ProjectInviteStatus = (typeof PROJECT_INVITE_STATUSES)[number];

export const connectionStatusValidator = v.union(
  ...CONNECTION_STATUSES.map((status) => v.literal(status)),
);

export const templateTypeValidator = v.union(
  ...TEMPLATE_TYPES.map((type) => v.literal(type)),
);

export const templateVisibilityValidator = v.union(
  ...TEMPLATE_VISIBILITIES.map((visibility) => v.literal(visibility)),
);

export const projectMemberRoleValidator = v.union(
  ...PROJECT_MEMBER_ROLES.map((role) => v.literal(role)),
);

export const projectMemberStatusValidator = v.union(
  ...PROJECT_MEMBER_STATUSES.map((status) => v.literal(status)),
);

export const projectInviteRoleValidator = v.union(
  ...PROJECT_INVITE_ROLES.map((role) => v.literal(role)),
);

export const projectInviteStatusValidator = v.union(
  ...PROJECT_INVITE_STATUSES.map((status) => v.literal(status)),
);

export const PROJECT_EDITOR_ROLES: readonly ProjectMemberRole[] = [
  "owner",
  "coCreator",
];
