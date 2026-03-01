import type { Id } from "@/convex/_generated/dataModel";

export type ConnectionPerson = {
  userId: Id<"users">;
  name: string;
  email: string | null;
  bio: string | null;
  image: string | null;
};

export type ConnectionAction =
  | "sendFriendRequest"
  | "acceptFriendRequest"
  | "declineFriendRequest"
  | "cancelFriendRequest"
  | "removeFriend"
  | "blockUser"
  | "unblockUser";

export type PendingConnectionAction = {
  action: ConnectionAction;
  userId: Id<"users">;
};

export type SidebarConnectionsData = {
  friends: ConnectionPerson[];
  sentRequests: ConnectionPerson[];
  receivedRequests: ConnectionPerson[];
  blocked: ConnectionPerson[];
};
