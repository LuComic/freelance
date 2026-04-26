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
    searchText: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.float64()),
    projectIds: v.optional(v.array(v.id("projects"))),
    lastOpenedProjectId: v.optional(v.id("projects")),
    notificationsLastSeenAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .searchIndex("search_text", { searchField: "searchText" }),

  connections: defineTable({
    requesterUserId: v.id("users"),
    receiverUserId: v.id("users"),
    pairKey: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("canceled"),
      v.literal("blocked"),
      v.literal("removed"),
    ),
    hiddenByUserIds: v.optional(v.array(v.id("users"))),
    actedByUserId: v.optional(v.id("users")),
    blockedByUserId: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_requester", ["requesterUserId"])
    .index("by_receiver", ["receiverUserId"])
    .index("by_requester_status", ["requesterUserId", "status"])
    .index("by_receiver_status", ["receiverUserId", "status"])
    .index("by_pair", ["requesterUserId", "receiverUserId"])
    .index("by_pair_key", ["pairKey"])
    .index("by_blocked_by", ["blockedByUserId"]),

  templates: defineTable({
    authorUserId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("project"), v.literal("page")),
    visibility: v.union(v.literal("private"), v.literal("public")),
    contentStorageId: v.optional(v.id("_storage")),
    contentJson: v.optional(v.string()),
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
    name: v.string(),
    description: v.optional(v.string()),
    // Canonical page order for sidebar/navigation.
    pageIds: v.array(v.id("pages")),
    joinCode: v.optional(v.string()),
    sourceTemplateId: v.optional(v.id("templates")),
    // Snapshot of template blueprint used at creation time.
    sourceTemplateContentStorageId: v.optional(v.id("_storage")),
    sourceTemplateContentJson: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
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
    formerName: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_user", ["projectId", "userId"])
    .index("by_project_role", ["projectId", "role"]),

  guestProjectUpgrades: defineTable({
    token: v.string(),
    guestUserId: v.id("users"),
    projectId: v.id("projects"),
    preferredPath: v.string(),
    formerName: v.string(),
    expiresAt: v.number(),
    consumedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_guest_user", ["guestUserId"])
    .index("by_project", ["projectId"]),

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

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("projectInviteReceived"),
      v.literal("projectMemberJoined"),
      v.literal("friendRequestReceived"),
      v.literal("friendRequestAccepted"),
      v.literal("clientStateChanged"),
    ),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    actorUserId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    projectNameSnapshot: v.optional(v.string()),
    pageId: v.optional(v.id("pages")),
    pageTitleSnapshot: v.optional(v.string()),
    inviteId: v.optional(v.id("projectInvites")),
    connectionUserId: v.optional(v.id("users")),
    actorNameSnapshot: v.string(),
    actorImageSnapshot: v.optional(v.string()),
    sidebarTarget: v.optional(
      v.union(v.literal("invites"), v.literal("got"), v.literal("friends")),
    ),
    componentInstanceId: v.optional(v.string()),
    componentType: v.optional(
      v.union(
        v.literal("Select"),
        v.literal("Radio"),
        v.literal("Feedback"),
        v.literal("Kanban"),
        v.literal("SimpleInput"),
      ),
    ),
    componentLabelSnapshot: v.optional(v.string()),
    changedComponentCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "isRead"]),

  projectActivity: defineTable({
    projectId: v.id("projects"),
    pageId: v.id("pages"),
    pageTitleSnapshot: v.string(),
    actorUserId: v.id("users"),
    actorNameSnapshot: v.string(),
    actorImageSnapshot: v.optional(v.string()),
    activityGroupId: v.optional(v.string()),
    entryOrder: v.optional(v.number()),
    componentInstanceId: v.string(),
    componentType: v.union(
      v.literal("Select"),
      v.literal("Radio"),
      v.literal("Feedback"),
      v.literal("Kanban"),
      v.literal("SimpleInput"),
    ),
    componentLabelSnapshot: v.string(),
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_project_created", ["projectId", "createdAt"]),

  projectChatMessages: defineTable({
    projectId: v.id("projects"),
    authorUserId: v.id("users"),
    authorNameSnapshot: v.string(),
    authorImageSnapshot: v.optional(v.string()),
    body: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
    deletedByUserId: v.optional(v.id("users")),
  })
    .index("by_project_created", ["projectId", "createdAt"])
    .index("by_project_author", ["projectId", "authorUserId"])
    .index("by_project_author_created", [
      "projectId",
      "authorUserId",
      "createdAt",
    ])
    .index("by_author", ["authorUserId"]),

  formSubmissions: defineTable({
    projectId: v.id("projects"),
    pageId: v.id("pages"),
    formInstanceId: v.string(),
    submittedByUserId: v.id("users"),
    submitterNameSnapshot: v.string(),
    submitterImageSnapshot: v.optional(v.string()),
    pageTitleSnapshot: v.string(),
    formTitleSnapshot: v.optional(v.string()),
    answers: v.array(
      v.object({
        fieldId: v.string(),
        fieldTypeSnapshot: v.union(
          v.literal("Select"),
          v.literal("Radio"),
          v.literal("SimpleInput"),
        ),
        fieldLabelSnapshot: v.string(),
        value: v.union(v.string(), v.array(v.string()), v.null()),
        displayValue: v.string(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_page_form", ["pageId", "formInstanceId"])
    .index("by_page_form_user", [
      "pageId",
      "formInstanceId",
      "submittedByUserId",
    ])
    .index("by_project_updated", ["projectId", "updatedAt"]),

  pages: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    contentStorageId: v.optional(v.id("_storage")),
    contentJson: v.optional(v.string()),
    sourceTemplateId: v.optional(v.id("templates")),
    createdByUserId: v.id("users"),
    updatedByUserId: v.id("users"),
    isArchived: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),

  betaFeedbackIdeas: defineTable({
    body: v.string(),
    tags: v.array(v.string()),
    authorUserId: v.id("users"),
    authorNameSnapshot: v.string(),
    voterUserIds: v.array(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_created_at", ["createdAt"])
    .index("by_author", ["authorUserId"]),
});

export default schema;
