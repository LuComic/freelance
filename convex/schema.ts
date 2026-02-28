import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.float64()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.float64()),
    projectIds: v.optional(v.array(v.id("projects"))),
    lastOpenedProjectId: v.optional(v.id("projects")),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  connections: defineTable({
    requesterUserId: v.id("users"),
    receiverUserId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("canceled"),
      v.literal("blocked"),
    ),
    hiddenByUserIds: v.optional(v.array(v.id("users"))),
    actedByUserId: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_requester", ["requesterUserId"])
    .index("by_receiver", ["receiverUserId"])
    .index("by_requester_status", ["requesterUserId", "status"])
    .index("by_receiver_status", ["receiverUserId", "status"])
    .index("by_pair", ["requesterUserId", "receiverUserId"]),

  templates: defineTable({
    authorUserId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("project"), v.literal("page")),
    visibility: v.union(v.literal("private"), v.literal("public")),
    contentStorageId: v.id("_storage"),
    createdAt: v.number(),
    updatedAt: v.number(),
    isArchived: v.optional(v.boolean()),
  })
    .index("by_author", ["authorUserId"])
    .index("by_type", ["type"])
    .index("by_visibility", ["visibility"])
    .index("by_author_type", ["authorUserId", "type"])
    .index("by_visibility_type", ["visibility", "type"]),

  projects: defineTable({
    ownerId: v.id("users"),
    createdByUserId: v.id("users"),
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    // Canonical page order for sidebar/navigation.
    pageIds: v.array(v.id("pages")),
    joinCode: v.optional(v.string()),
    sourceTemplateId: v.optional(v.id("templates")),
    // Snapshot of template blueprint used at creation time.
    sourceTemplateContentStorageId: v.optional(v.id("_storage")),
    isArchived: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_slug", ["slug"])
    .index("by_owner_slug", ["ownerId", "slug"])
    .index("by_created_by", ["createdByUserId"])
    .index("by_join_code", ["joinCode"]),

  projectMembers: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("coCreator"),
      v.literal("client"),
    ),
    status: v.union(v.literal("active"), v.literal("removed")),
    addedByUserId: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_user", ["projectId", "userId"])
    .index("by_project_role", ["projectId", "role"]),

  projectInvites: defineTable({
    projectId: v.id("projects"),
    invitedByUserId: v.id("users"),
    email: v.string(),
    role: v.union(v.literal("coCreator"), v.literal("client")),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("revoked"),
      v.literal("expired"),
      v.literal("declined"),
    ),
    invitedUserId: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_email", ["email"])
    .index("by_project_email", ["projectId", "email"])
    .index("by_project_status", ["projectId", "status"]),

  pages: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    contentStorageId: v.optional(v.id("_storage")),
    contentJson: v.optional(v.string()),
    sourceTemplateId: v.optional(v.id("templates")),
    createdByUserId: v.id("users"),
    updatedByUserId: v.id("users"),
    isArchived: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_slug", ["projectId", "slug"]),
});

export default schema;
