import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { buildUserDisplayName } from "../connections/model";
import type {
  PageComponentDocument,
  PageComponentType,
  PageDocumentV1,
} from "../../lib/pageDocument";

export const NOTIFICATION_COMPONENT_TYPES = [
  "Select",
  "Radio",
  "Feedback",
  "Kanban",
  "SimpleInput",
] as const;

export type NotificationComponentType =
  (typeof NOTIFICATION_COMPONENT_TYPES)[number];

export type NotificationSidebarTarget = "invites" | "got" | "friends";

type NotificationType = Doc<"notifications">["type"] | "projectMemberJoined";

type CreateNotificationInput = {
  userId: Id<"users">;
  type: NotificationType;
  actorUserId: Id<"users">;
  actorNameSnapshot: string;
  actorImageSnapshot?: string | null;
  projectId?: Id<"projects">;
  projectNameSnapshot?: string;
  pageId?: Id<"pages">;
  pageTitleSnapshot?: string;
  inviteId?: Id<"projectInvites">;
  connectionUserId?: Id<"users">;
  sidebarTarget?: NotificationSidebarTarget;
  componentInstanceId?: string;
  componentType?: NotificationComponentType;
  componentLabelSnapshot?: string;
  changedComponentCount?: number;
};

type ChangedLiveStateComponent = {
  instanceId: string;
  type: NotificationComponentType;
  label: string;
};

type NotificationProject = Pick<Doc<"projects">, "_id" | "name">;
type NotificationActor = Pick<Doc<"users">, "_id" | "name" | "email" | "image">;

export function buildNotificationActorSnapshot(
  user: Pick<Doc<"users">, "_id" | "name" | "email" | "image">,
) {
  return {
    actorUserId: user._id,
    actorNameSnapshot: buildUserDisplayName(user),
    actorImageSnapshot: user.image ?? null,
  };
}

export async function createNotification(
  ctx: MutationCtx,
  input: CreateNotificationInput,
) {
  const now = Date.now();

  return ctx.db.insert("notifications", {
    userId: input.userId,
    type: input.type as Doc<"notifications">["type"],
    isRead: false,
    actorUserId: input.actorUserId,
    projectId: input.projectId,
    projectNameSnapshot: input.projectNameSnapshot,
    pageId: input.pageId,
    pageTitleSnapshot: input.pageTitleSnapshot,
    inviteId: input.inviteId,
    connectionUserId: input.connectionUserId,
    actorNameSnapshot: input.actorNameSnapshot,
    actorImageSnapshot: input.actorImageSnapshot ?? undefined,
    sidebarTarget: input.sidebarTarget,
    componentInstanceId: input.componentInstanceId,
    componentType: input.componentType,
    componentLabelSnapshot: input.componentLabelSnapshot,
    changedComponentCount: input.changedComponentCount,
    createdAt: now,
    updatedAt: now,
  });
}

export async function createProjectJoinNotifications(
  ctx: MutationCtx,
  args: {
    project: NotificationProject;
    joinedUser: NotificationActor;
  },
) {
  const projectMembers = await ctx.db
    .query("projectMembers")
    .withIndex("by_project", (query) => query.eq("projectId", args.project._id))
    .collect();
  const recipients = projectMembers.filter(
    (projectMember) =>
      projectMember.status === "active" &&
      projectMember.userId !== args.joinedUser._id &&
      (projectMember.role === "owner" || projectMember.role === "coCreator"),
  );

  if (recipients.length === 0) {
    return;
  }

  const actorSnapshot = buildNotificationActorSnapshot(args.joinedUser);

  await Promise.all(
    recipients.map((recipient) =>
      createNotification(ctx, {
        userId: recipient.userId,
        type: "projectMemberJoined",
        ...actorSnapshot,
        projectId: args.project._id,
        projectNameSnapshot: args.project.name,
      }),
    ),
  );
}

export async function markAllNotificationsReadForUser(
  ctx: MutationCtx,
  userId: Id<"users">,
) {
  const unreadNotifications = await ctx.db
    .query("notifications")
    .withIndex("by_user_read", (query) =>
      query.eq("userId", userId).eq("isRead", false),
    )
    .collect();

  if (unreadNotifications.length === 0) {
    return 0;
  }

  const now = Date.now();

  await Promise.all(
    unreadNotifications.map((notification) =>
      ctx.db.patch(notification._id, {
        isRead: true,
        readAt: now,
        updatedAt: now,
      }),
    ),
  );

  return unreadNotifications.length;
}

function isNotificationComponentType(
  value: PageComponentType,
): value is NotificationComponentType {
  return NOTIFICATION_COMPONENT_TYPES.includes(
    value as NotificationComponentType,
  );
}

function getComponentLabel(component: PageComponentDocument) {
  switch (component.type) {
    case "Select": {
      const title = component.config.title.trim();
      return title || "Select";
    }
    case "Radio": {
      const title = component.config.title.trim();
      return title || "Radio";
    }
    case "Feedback":
      return "Feedback";
    case "Kanban":
      return "Kanban";
    case "SimpleInput":
      return "Simple Input";
    default:
      return component.type;
  }
}

function stringifyLiveState(component: PageComponentDocument) {
  return JSON.stringify(component.state);
}

export function getChangedLiveStateComponents(
  currentDocument: PageDocumentV1,
  nextDocument: PageDocumentV1,
) {
  const changedComponents: ChangedLiveStateComponent[] = [];

  for (const [instanceId, currentComponent] of Object.entries(
    currentDocument.components,
  )) {
    const nextComponent = nextDocument.components[instanceId];

    if (!nextComponent || nextComponent.type !== currentComponent.type) {
      continue;
    }

    if (!isNotificationComponentType(currentComponent.type)) {
      continue;
    }

    if (
      stringifyLiveState(currentComponent) === stringifyLiveState(nextComponent)
    ) {
      continue;
    }

    changedComponents.push({
      instanceId,
      type: currentComponent.type,
      label: getComponentLabel(nextComponent),
    });
  }

  return changedComponents;
}
