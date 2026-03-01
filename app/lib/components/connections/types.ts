import type { Id } from "@/convex/_generated/dataModel";

export type ConnectionRelationship =
  | "none"
  | "friend"
  | "sent"
  | "received"
  | "blockedByMe"
  | "blockedByThem";

export type ConnectionPerson = {
  userId: Id<"users">;
  name: string;
  email: string | null;
  bio: string | null;
  image: string | null;
  relationship?: ConnectionRelationship;
};

export type SidebarProjectInvite = {
  inviteId: Id<"projectInvites">;
  projectId: Id<"projects">;
  projectSlug: string;
  projectName: string;
  role: "client" | "coCreator";
  label: string;
  invitedByUserId: Id<"users">;
  invitedByName: string;
  image: string | null;
};

export type ConnectionAction =
  | "sendFriendRequest"
  | "acceptFriendRequest"
  | "declineFriendRequest"
  | "cancelFriendRequest"
  | "removeFriend"
  | "forgetCollaborator"
  | "blockUser"
  | "unblockUser";

export type PendingConnectionAction = {
  action: ConnectionAction;
  userId: Id<"users">;
};

export type SidebarConnectionsData = {
  friends: ConnectionPerson[];
  collaborators: ConnectionPerson[];
  invites: SidebarProjectInvite[];
  sentRequests: ConnectionPerson[];
  receivedRequests: ConnectionPerson[];
  blocked: ConnectionPerson[];
};
