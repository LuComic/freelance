"use client";
import {
  ChevronRight,
  EllipsisVertical,
  Plus,
  UserMinus,
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
import type { ConnectionAction, ConnectionPerson } from "../connections/types";

interface ConnectionItemProps {
  title: string;
  items: ConnectionPerson[];
  type: "friends" | "collabs" | "sent" | "got" | "blocked";
}

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

function ConnectionAvatar({ item }: { item: ConnectionPerson }) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageSrc = item.image?.trim() || null;

  if (imageSrc && !hasImageError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        alt={`${item.name} avatar`}
        className="aspect-square w-5 h-5 rounded-full object-cover bg-(--dim)"
        referrerPolicy="no-referrer"
        onError={() => setHasImageError(true)}
      />
    );
  }

  return (
    <div className="aspect-square w-5 h-5 bg-(--dim) rounded-full flex items-center justify-center text-[9px] font-medium text-(--gray-page)">
      {getInitials(item.name)}
    </div>
  );
}

export const ConnectionItem = ({ title, items, type }: ConnectionItemProps) => {
  const [itemExpanded, setItemExpanded] = useState(false);
  const { runConnectionAction, pendingAction, error, clearError } =
    useConnectionActions();
  const isExpanded = itemExpanded && items.length > 0;

  const handleAction = async (
    action: ConnectionAction,
    userId: ConnectionPerson["userId"],
  ) => {
    clearError();
    await runConnectionAction(action, userId);
  };

  const renderActionItem = (
    label: string,
    icon: ReactNode,
    userId: ConnectionPerson["userId"],
    action?: ConnectionAction,
    variant: "default" | "danger" = "default",
    disabled = false,
  ) => {
    const isPending = pendingAction?.userId === userId;
    const isDanger = variant === "danger";

    return (
      <MenubarItem
        disabled={disabled || isPending}
        onClick={action ? () => void handleAction(action, userId) : undefined}
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

  return (
    <>
      <button
        className="rounded-lg p-1 px-1.5 gap-2 hover:bg-(--darkest-hover) w-full text-(--gray) flex items-center justify-start  md:text-base text-sm"
        onClick={() => setItemExpanded((previous) => (items.length > 0 ? !previous : false))}
      >
        <ChevronRight className={`${isExpanded ? "rotate-90" : ""}`} />
        {title} ({items.length})
      </button>
      {isExpanded
        ? items.map((item) => (
            <span
              className="pl-8 flex w-full items-center  justify-start gap-2 hover:bg-(--darkest-hover) rounded-lg md:text-base text-sm p-1"
              key={item.userId}
            >
              <ConnectionAvatar item={item} />
              {item.name}
              {type === "friends" ? (
                <Menubar className="ml-auto h-auto bg-transparent border-none shadow-none p-0">
                  <MenubarMenu>
                    <MenubarTrigger className=" data-highlighted:bg-transparent data-[state=open]:bg-transparent data-highlighted:text-(--light) data-[state=open]:text-(--light) py-0">
                      <EllipsisVertical size={20} />
                    </MenubarTrigger>
                    <MenubarContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
                      <MenubarGroup>
                        {renderActionItem(
                          "Invite",
                          <Plus />,
                          item.userId,
                          undefined,
                          "default",
                          true,
                        )}
                        <MenubarSeparator className="bg-(--gray)" />
                        {renderActionItem(
                          "Remove friend",
                          <UserMinus color="var(--declined-border)" />,
                          item.userId,
                          "removeFriend",
                          "danger",
                        )}
                        {renderActionItem(
                          "Block",
                          <UserX color="var(--declined-border)" />,
                          item.userId,
                          "blockUser",
                          "danger",
                        )}
                      </MenubarGroup>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              ) : type === "collabs" ? (
                <Menubar className="h-auto ml-auto bg-transparent border-none shadow-none p-0">
                  <MenubarMenu>
                    <MenubarTrigger className=" data-highlighted:bg-transparent data-[state=open]:bg-transparent data-highlighted:text-(--light) data-[state=open]:text-(--light) py-0">
                      <EllipsisVertical size={20} />
                    </MenubarTrigger>
                    <MenubarContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
                      <MenubarGroup>
                        {renderActionItem(
                          "Invite",
                          <Plus />,
                          item.userId,
                          undefined,
                          "default",
                          true,
                        )}
                        <MenubarSeparator className="bg-(--gray)" />
                        {renderActionItem(
                          "Block",
                          <UserX color="var(--declined-border)" />,
                          item.userId,
                          undefined,
                          "danger",
                          true,
                        )}
                      </MenubarGroup>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              ) : type === "got" ? (
                <Menubar className="h-auto ml-auto bg-transparent border-none shadow-none p-0">
                  <MenubarMenu>
                    <MenubarTrigger className=" data-highlighted:bg-transparent data-[state=open]:bg-transparent data-highlighted:text-(--light) data-[state=open]:text-(--light) py-0">
                      <EllipsisVertical size={20} />
                    </MenubarTrigger>
                    <MenubarContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
                      <MenubarGroup>
                        {renderActionItem(
                          "Accept",
                          <Plus />,
                          item.userId,
                          "acceptFriendRequest",
                        )}
                        {renderActionItem(
                          "Decline",
                          <X />,
                          item.userId,
                          "declineFriendRequest",
                        )}
                        <MenubarSeparator className="bg-(--gray)" />
                        {renderActionItem(
                          "Block",
                          <UserX color="var(--declined-border)" />,
                          item.userId,
                          "blockUser",
                          "danger",
                        )}
                      </MenubarGroup>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              ) : type === "sent" ? (
                <Menubar className="h-auto ml-auto bg-transparent border-none shadow-none p-0">
                  <MenubarMenu>
                    <MenubarTrigger className=" data-highlighted:bg-transparent data-[state=open]:bg-transparent data-highlighted:text-(--light) data-[state=open]:text-(--light) py-0">
                      <EllipsisVertical size={20} />
                    </MenubarTrigger>
                    <MenubarContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
                      <MenubarGroup>
                        {renderActionItem(
                          "Cancel",
                          <X />,
                          item.userId,
                          "cancelFriendRequest",
                        )}
                        <MenubarSeparator className="bg-(--gray)" />
                        {renderActionItem(
                          "Block",
                          <UserX color="var(--declined-border)" />,
                          item.userId,
                          "blockUser",
                          "danger",
                        )}
                      </MenubarGroup>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              ) : type === "blocked" ? (
                <Menubar className="h-auto ml-auto bg-transparent border-none shadow-none p-0">
                  <MenubarMenu>
                    <MenubarTrigger className=" data-highlighted:bg-transparent data-[state=open]:bg-transparent data-highlighted:text-(--light) data-[state=open]:text-(--light) py-0">
                      <EllipsisVertical size={20} />
                    </MenubarTrigger>
                    <MenubarContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
                      <MenubarGroup>
                        {renderActionItem(
                          "Unblock",
                          <X />,
                          item.userId,
                          "unblockUser",
                        )}
                      </MenubarGroup>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              ) : null}
            </span>
          ))
        : null}
      {isExpanded && error ? (
        <p className="pl-8 text-sm text-(--declined-border)">{error}</p>
      ) : null}
    </>
  );
};
