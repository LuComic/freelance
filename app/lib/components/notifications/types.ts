import type { Id } from "@/convex/_generated/dataModel";
import type { SidebarConnectionsSection } from "../sidebar/SidebarControllerContext";

type BaseNotification = {
  id: Id<"notifications">;
  isRead: boolean;
  createdAt: number;
  actorName: string;
  actorImage: string | null;
};

export type ConnectionNotification = BaseNotification & {
  type:
    | "projectInviteReceived"
    | "friendRequestReceived"
    | "friendRequestAccepted";
  projectName: string | null;
  sidebarTarget: SidebarConnectionsSection | null;
};

export type ClientStateChangedNotification = BaseNotification & {
  type: "clientStateChanged";
  projectSlug: string | null;
  projectName: string | null;
  pageTitle: string | null;
  componentLabel: string | null;
  changedComponentCount: number;
};

export type AppNotification =
  | ConnectionNotification
  | ClientStateChangedNotification;
