"use client";

import {
  ChevronRight,
  EllipsisVertical,
  HatGlasses,
  Plus,
  UserMinus,
  UserPlus,
  UserX,
  X,
} from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useState, type ReactNode } from "react";
import { useConnectionActions } from "../connections/useConnectionActions";
import { useProjectInviteActions } from "../connections/useProjectInviteActions";
import type {
  ConnectionAction,
  ConnectionPerson,
  SidebarProjectInvite,
} from "../connections/types";
import { useSearchBar } from "../searchbar/SearchBarContext";

type UserConnectionItemProps = {
  title: string;
  items: ConnectionPerson[];
  type: "friends" | "collabs" | "sent" | "got" | "blocked";
  requestedOpenToken?: number;
};

type InviteConnectionItemProps = {
  title: string;
  items: SidebarProjectInvite[];
  type: "invites";
  requestedOpenToken?: number;
};

type ConnectionItemProps = UserConnectionItemProps | InviteConnectionItemProps;

function getInitials(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getAvatarData(item: ConnectionPerson | SidebarProjectInvite) {
  if ("inviteId" in item) {
    return {
      name: item.invitedByName,
      image: item.image,
      alt: `${item.invitedByName} avatar`,
    };
  }

  return {
    name: item.name,
    image: item.image,
    alt: `${item.name} avatar`,
  };
}

function ConnectionAvatar({
  item,
}: {
  item: ConnectionPerson | SidebarProjectInvite;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const { alt, image, name } = getAvatarData(item);
  const imageSrc = image?.trim() || null;

  if (imageSrc && !hasImageError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        alt={alt}
        className="aspect-square w-5 h-5 rounded-full object-cover bg-(--dim)"
        referrerPolicy="no-referrer"
        onError={() => setHasImageError(true)}
      />
    );
  }

  return (
    <div className="aspect-square w-5 h-5 bg-(--dim) rounded-full flex items-center justify-center text-[9px] font-medium text-(--gray-page)">
      {getInitials(name)}
    </div>
  );
}

function isInviteItem(
  item: ConnectionPerson | SidebarProjectInvite,
): item is SidebarProjectInvite {
  return "inviteId" in item;
}

function formatInviteRole(role: SidebarProjectInvite["role"]) {
  return role === "coCreator" ? "co-creator" : "client";
}

export const ConnectionItem = ({
  title,
  items,
  type,
  requestedOpenToken = 0,
}: ConnectionItemProps) => {
  const [itemExpanded, setItemExpanded] = useState(false);
  const [handledOpenToken, setHandledOpenToken] = useState(0);
  const {
    runConnectionAction,
    pendingAction: pendingConnectionAction,
    error: connectionError,
    clearError: clearConnectionError,
  } = useConnectionActions();
  const {
    runProjectInviteAction,
    pendingAction: pendingInviteAction,
    error: inviteError,
    clearError: clearInviteError,
  } = useProjectInviteActions();
  const { openPersonModal } = useSearchBar();
  const hasExternalOpenRequest =
    items.length > 0 && requestedOpenToken > handledOpenToken;
  const isExpanded = (itemExpanded || hasExternalOpenRequest) && items.length > 0;

  const handleAction = async (
    action: ConnectionAction,
    userId: ConnectionPerson["userId"],
  ) => {
    clearConnectionError();
    await runConnectionAction(action, userId);
  };

  const renderActionItem = (
    label: string,
    icon: ReactNode,
    variant: "default" | "danger" = "default",
    disabled = false,
    isPending = false,
    onClick?: () => void,
  ) => {
    const isDanger = variant === "danger";

    return (
      <MenubarItem
        disabled={disabled || isPending}
        onClick={onClick}
        className={`${
          isDanger
            ? "hover:bg-(--declined-bg)/5! hover:text-(--declined-border)! text-(--declined-border) "
            : "hover:bg-(--darkest-hover)! hover:text-(--light)! "
        }data-disabled:opacity-50 data-disabled:pointer-events-none`}
      >
        {icon}
        {label}
      </MenubarItem>
    );
  };

  const renderRow = (item: ConnectionPerson | SidebarProjectInvite) => {
    const isInvite = isInviteItem(item);
    const pendingForUser =
      !isInvite && pendingConnectionAction?.userId === item.userId;
    const pendingForInvite =
      isInvite && pendingInviteAction?.inviteId === item.inviteId;
    const collaboratorRelationship =
      !isInvite && type === "collabs" ? (item.relationship ?? "none") : null;

    return (
      <span
        className="pl-8 flex w-full items-center  justify-start gap-2 hover:bg-(--darkest-hover) rounded-lg md:text-base text-sm p-1"
        key={isInvite ? item.inviteId : item.userId}
      >
        <ConnectionAvatar item={item} />
        {isInvite ? (
          <span>
            {item.projectName}{" "}
            <span className="text-(--gray-page)">
              as {formatInviteRole(item.role)}
            </span>
          </span>
        ) : (
          item.name
        )}
        <Menubar className="h-auto ml-auto bg-transparent border-none shadow-none p-0">
          <MenubarMenu>
            <MenubarTrigger className=" data-highlighted:bg-transparent data-[state=open]:bg-transparent data-highlighted:text-(--light) data-[state=open]:text-(--light) py-0">
              <EllipsisVertical size={20} />
            </MenubarTrigger>
            <MenubarContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
              <MenubarGroup>
                {isInvite ? (
                  <>
                    {renderActionItem(
                      "Accept",
                      <Plus />,
                      "default",
                      false,
                      pendingForInvite,
                      () => {
                        clearInviteError();
                        void runProjectInviteAction("accept", item.inviteId);
                      },
                    )}
                    {renderActionItem(
                      "Decline",
                      <X />,
                      "default",
                      false,
                      pendingForInvite,
                      () => {
                        clearInviteError();
                        void runProjectInviteAction("decline", item.inviteId);
                      },
                    )}
                  </>
                ) : type === "friends" ? (
                  <>
                    {renderActionItem(
                      "Invite",
                      <Plus />,
                      "default",
                      false,
                      pendingForUser,
                      () =>
                        openPersonModal(item, {
                          expandInviteSection: true,
                        }),
                    )}
                    <MenubarSeparator className="bg-(--gray)" />
                    {renderActionItem(
                      "Remove friend",
                      <UserMinus color="var(--declined-border)" />,
                      "danger",
                      false,
                      pendingForUser,
                      () => void handleAction("removeFriend", item.userId),
                    )}
                    {renderActionItem(
                      "Block",
                      <UserX color="var(--declined-border)" />,
                      "danger",
                      false,
                      pendingForUser,
                      () => void handleAction("blockUser", item.userId),
                    )}
                  </>
                ) : type === "collabs" ? (
                  <>
                    {collaboratorRelationship === "none" ? (
                      renderActionItem(
                        "Add friend",
                        <UserPlus />,
                        "default",
                        false,
                        pendingForUser,
                        () =>
                          void handleAction("sendFriendRequest", item.userId),
                      )
                    ) : collaboratorRelationship === "sent" ? (
                      renderActionItem(
                        "Cancel request",
                        <X />,
                        "default",
                        false,
                        pendingForUser,
                        () =>
                          void handleAction("cancelFriendRequest", item.userId),
                      )
                    ) : collaboratorRelationship === "received" ? (
                      <>
                        {renderActionItem(
                          "Accept request",
                          <UserPlus />,
                          "default",
                          false,
                          pendingForUser,
                          () =>
                            void handleAction(
                              "acceptFriendRequest",
                              item.userId,
                            ),
                        )}
                        {renderActionItem(
                          "Decline request",
                          <X />,
                          "default",
                          false,
                          pendingForUser,
                          () =>
                            void handleAction(
                              "declineFriendRequest",
                              item.userId,
                            ),
                        )}
                      </>
                    ) : collaboratorRelationship === "friend" ? (
                      renderActionItem(
                        "Remove friend",
                        <UserMinus color="var(--declined-border)" />,
                        "danger",
                        false,
                        pendingForUser,
                        () => void handleAction("removeFriend", item.userId),
                      )
                    ) : null}
                    {renderActionItem(
                      "Invite",
                      <Plus />,
                      "default",
                      false,
                      pendingForUser,
                      () =>
                        openPersonModal(item, {
                          expandInviteSection: true,
                        }),
                    )}
                    {renderActionItem(
                      "Forget",
                      <HatGlasses />,
                      "default",
                      false,
                      pendingForUser,
                      () =>
                        void handleAction("forgetCollaborator", item.userId),
                    )}
                    <MenubarSeparator className="bg-(--gray)" />
                    {renderActionItem(
                      "Block",
                      <UserX color="var(--declined-border)" />,
                      "danger",
                      false,
                      pendingForUser,
                      () => void handleAction("blockUser", item.userId),
                    )}
                  </>
                ) : type === "got" ? (
                  <>
                    {renderActionItem(
                      "Accept",
                      <UserPlus />,
                      "default",
                      false,
                      pendingForUser,
                      () =>
                        void handleAction("acceptFriendRequest", item.userId),
                    )}
                    {renderActionItem(
                      "Decline",
                      <X />,
                      "default",
                      false,
                      pendingForUser,
                      () =>
                        void handleAction("declineFriendRequest", item.userId),
                    )}
                    <MenubarSeparator className="bg-(--gray)" />
                    {renderActionItem(
                      "Block",
                      <UserX color="var(--declined-border)" />,
                      "danger",
                      false,
                      pendingForUser,
                      () => void handleAction("blockUser", item.userId),
                    )}
                  </>
                ) : type === "sent" ? (
                  <>
                    {renderActionItem(
                      "Cancel",
                      <X />,
                      "default",
                      false,
                      pendingForUser,
                      () =>
                        void handleAction("cancelFriendRequest", item.userId),
                    )}
                    <MenubarSeparator className="bg-(--gray)" />
                    {renderActionItem(
                      "Block",
                      <UserX color="var(--declined-border)" />,
                      "danger",
                      false,
                      pendingForUser,
                      () => void handleAction("blockUser", item.userId),
                    )}
                  </>
                ) : type === "blocked" ? (
                  renderActionItem(
                    "Unblock",
                    <X />,
                    "default",
                    false,
                    pendingForUser,
                    () => void handleAction("unblockUser", item.userId),
                  )
                ) : null}
              </MenubarGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </span>
    );
  };

  return (
    <>
      <button
        className="rounded-lg p-1 px-1.5 gap-2 hover:bg-(--darkest-hover) w-full text-(--gray) flex items-center justify-start  md:text-base text-sm"
        onClick={() => {
          if (requestedOpenToken > handledOpenToken) {
            setHandledOpenToken(requestedOpenToken);
          }

          setItemExpanded((previous) =>
            items.length > 0 ? !(previous || hasExternalOpenRequest) : false,
          );
        }}
      >
        <ChevronRight className={`${isExpanded ? "rotate-90" : ""}`} />
        {title} ({items.length})
      </button>
      {isExpanded ? items.map(renderRow) : null}
      {isExpanded && (type === "invites" ? inviteError : connectionError) ? (
        <p className="pl-8 text-sm text-(--declined-border)">
          {type === "invites" ? inviteError : connectionError}
        </p>
      ) : null}
    </>
  );
};
