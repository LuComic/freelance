"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import type { SearchPerson } from "./SearchBarData";
import { ChevronRight, X } from "lucide-react";
import { useConnectionActions } from "../connections/useConnectionActions";
import type { ConnectionAction } from "../connections/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PersonModalProps = {
  person: SearchPerson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const MOCK_INVITEABLE_PROJECTS = [
  { id: "brand-refresh", name: "Brand Refresh" },
  { id: "marketing-site", name: "Marketing Site" },
  { id: "client-portal", name: "Client Portal" },
] as const;

const INVITE_ROLE_OPTIONS = [
  { value: "client", label: "Client" },
  { value: "coCreator", label: "Co-creator" },
] as const;

export const PersonModal = ({
  person,
  open,
  onOpenChange,
}: PersonModalProps) => {
  const closeModal = useCallback(() => onOpenChange(false), [onOpenChange]);
  const relationshipData = useQuery(
    api.connections.queries.getRelationshipWithUser,
    open && person ? { targetUserId: person.userId } : "skip",
  );
  const { runConnectionAction, pendingAction, error, clearError } =
    useConnectionActions();
  const visiblePerson = relationshipData?.user ?? person;
  const relationship = relationshipData?.relationship;
  const isPending = person ? pendingAction?.userId === person.userId : false;
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedRole, setSelectedRole] = useState<
    (typeof INVITE_ROLE_OPTIONS)[number]["value"] | ""
  >("client");
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);

  const handleAction = async (action: ConnectionAction) => {
    if (!person) {
      return;
    }

    clearError();
    await runConnectionAction(action, person.userId);
  };

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "auto";
      return;
    }

    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [closeModal, open]);

  useEffect(() => {
    clearError();
  }, [clearError, open, person?.userId]);

  useEffect(() => {
    if (!open) {
      setShowInviteDropdown(false);
    }
  }, [open, person?.userId]);

  if (!open || !person || !visiblePerson) return null;

  return (
    <div
      className="fixed px-2 inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className="w-full max-h-[85vh] h-auto flex flex-col items-start justify-start gap-2 p-3 md:max-w-3xl bg-(--darkest) rounded-xl overflow-y-auto border border-(--gray)"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-start justify-between gap-2">
          <div className="flex justify-between items-center w-full">
            <p className="md:text-3xl text-xl font-medium">
              {visiblePerson.name}
            </p>
            <button
              onClick={closeModal}
              className="p-1 hover:bg-(--gray)/20 rounded-lg"
            >
              <X />
            </button>
          </div>
        </div>
        {visiblePerson.email ? (
          <p className="text-(--gray-page)">{visiblePerson.email}</p>
        ) : null}
        {visiblePerson.bio ? (
          <p className="text-(--gray-page)">{visiblePerson.bio}</p>
        ) : null}
        <div className="w-full border-t border-(--gray) py-3 flex flex-col gap-2">
          <button
            type="button"
            className="font-medium flex items-center justify-start gap-2 w-max"
            onClick={() => setShowInviteDropdown((prev) => !prev)}
          >
            Invite to project
            <ChevronRight
              size={18}
              className={showInviteDropdown ? "rotate-90" : ""}
            />
          </button>
          {showInviteDropdown ? (
            <div className="w-full flex flex-col gap-2">
              {/* Eventually this should list projects where the current user is the owner or a co-creator. */}
              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
              >
                <SelectTrigger className="w-full bg-(--qutie-dark) border-(--gray)">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent className="bg-(--quite-dark) border-none text-(--gray-page)">
                  <SelectGroup className="bg-(--quite-dark)">
                    {MOCK_INVITEABLE_PROJECTS.map((project) => (
                      <SelectItem
                        key={project.id}
                        value={project.id}
                        className="data-highlighted:bg-(--darkest-hover) data-highlighted:text-(--light)"
                      >
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="w-full flex items-center gap-4">
                {INVITE_ROLE_OPTIONS.map((role) => {
                  const selected = selectedRole === role.value;

                  return (
                    <button
                      key={role.value}
                      type="button"
                      className="flex items-center gap-2 justify-start"
                      onClick={() => setSelectedRole(role.value)}
                    >
                      <span className="h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-full bg-(--dim)">
                        {selected ? (
                          <span className="bg-(--vibrant) aspect-square h-full rounded-full" />
                        ) : null}
                      </span>
                      <span>{role.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-(--vibrant)"
                disabled={!selectedProjectId || !selectedRole}
                onClick={() => {
                  const selectedProject = MOCK_INVITEABLE_PROJECTS.find(
                    (project) => project.id === selectedProjectId,
                  );
                  const roleLabel = INVITE_ROLE_OPTIONS.find(
                    (role) => role.value === selectedRole,
                  )?.label;

                  if (!selectedProject || !roleLabel) {
                    return;
                  }

                  setInviteMessage(
                    `Invite mock ready: ${visiblePerson.name} -> ${selectedProject.name} as ${roleLabel}.`,
                  );
                }}
              >
                Invite
              </button>

              {inviteMessage ? (
                <p className="text-sm text-(--gray-page)">{inviteMessage}</p>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="w-full flex flex-col gap-2">
          {relationship === undefined ? (
            <button
              type="button"
              disabled
              className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--gray) hover:bg-(--gray)/20 disabled:opacity-60"
            >
              Loading...
            </button>
          ) : relationship === "none" ? (
            <>
              <button
                type="button"
                className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--vibrant) bg-(--vibrant)/10 hover:bg-(--vibrant)/20 disabled:opacity-60"
                onClick={() => void handleAction("sendFriendRequest")}
                disabled={isPending}
              >
                Send friend request
              </button>
              <button
                type="button"
                className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20 text-(--light) disabled:opacity-60"
                onClick={() => void handleAction("blockUser")}
                disabled={isPending}
              >
                Block
              </button>
            </>
          ) : relationship === "sent" ? (
            <>
              <button
                type="button"
                className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--gray) hover:bg-(--gray)/20 disabled:opacity-60"
                onClick={() => void handleAction("cancelFriendRequest")}
                disabled={isPending}
              >
                Cancel request
              </button>
              <button
                type="button"
                className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20 text-(--light) disabled:opacity-60"
                onClick={() => void handleAction("blockUser")}
                disabled={isPending}
              >
                Block
              </button>
            </>
          ) : relationship === "received" ? (
            <>
              <button
                type="button"
                className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--vibrant) bg-(--vibrant)/10 hover:bg-(--vibrant)/20 disabled:opacity-60"
                onClick={() => void handleAction("acceptFriendRequest")}
                disabled={isPending}
              >
                Accept request
              </button>
              <button
                type="button"
                className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--gray) hover:bg-(--gray)/20 disabled:opacity-60"
                onClick={() => void handleAction("declineFriendRequest")}
                disabled={isPending}
              >
                Decline request
              </button>
              <button
                type="button"
                className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20 text-(--light) disabled:opacity-60"
                onClick={() => void handleAction("blockUser")}
                disabled={isPending}
              >
                Block
              </button>
            </>
          ) : relationship === "friend" ? (
            <>
              <button
                type="button"
                className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--gray) hover:bg-(--gray)/20 disabled:opacity-60"
                onClick={() => void handleAction("removeFriend")}
                disabled={isPending}
              >
                Remove friend
              </button>
              <button
                type="button"
                className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20 text-(--light) disabled:opacity-60"
                onClick={() => void handleAction("blockUser")}
                disabled={isPending}
              >
                Block
              </button>
            </>
          ) : relationship === "blockedByMe" ? (
            <button
              type="button"
              className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--gray) hover:bg-(--gray)/20 disabled:opacity-60"
              onClick={() => void handleAction("unblockUser")}
              disabled={isPending}
            >
              Unblock
            </button>
          ) : null}
        </div>
        {error ? (
          <p className="text-sm text-(--declined-border)">{error}</p>
        ) : null}
      </div>
    </div>
  );
};
