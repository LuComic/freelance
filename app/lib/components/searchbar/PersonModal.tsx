"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
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
import type { InviteRole, PersonInviteDefaults } from "./SearchBarContext";

type PersonModalProps = {
  person: SearchPerson | null;
  inviteDefaults?: PersonInviteDefaults | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const INVITE_ROLE_OPTIONS = [
  { value: "client", label: "Client" },
  { value: "coCreator", label: "Co-creator" },
] as const;

type ProjectInviteActionMode =
  | "invite"
  | "upgrade"
  | "downgrade"
  | "unavailable";

export const PersonModal = ({
  person,
  inviteDefaults,
  open,
  onOpenChange,
}: PersonModalProps) => {
  const closeModal = useCallback(() => onOpenChange(false), [onOpenChange]);
  const relationshipData = useQuery(
    api.connections.queries.getRelationshipWithUser,
    open && person ? { targetUserId: person.userId } : "skip",
  );
  const inviteableProjects = useQuery(
    api.projects.invites.listInviteableProjects,
    open && person ? {} : "skip",
  );
  const inviteUserToProject = useMutation(
    api.projects.invites.inviteUserToProject,
  );
  const changeProjectMemberRole = useMutation(
    api.projects.members.changeProjectMemberRole,
  );
  const { runConnectionAction, pendingAction, error, clearError } =
    useConnectionActions();
  const visiblePerson = relationshipData?.user ?? person;
  const relationship = relationshipData?.relationship;
  const isPending = person ? pendingAction?.userId === person.userId : false;
  const [selectedProjectId, setSelectedProjectId] = useState<
    Id<"projects"> | ""
  >(inviteDefaults?.projectId ?? "");
  const [selectedRole, setSelectedRole] = useState<InviteRole | "">(
    inviteDefaults?.role ?? "client",
  );
  const selectedProjectMembership = useQuery(
    api.projects.members.getProjectMembershipForUser,
    open && person && selectedProjectId
      ? {
          projectId: selectedProjectId,
          targetUserId: person.userId,
        }
      : "skip",
  );
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isSubmittingInviteAction, setIsSubmittingInviteAction] =
    useState(false);
  const [showInviteDropdown, setShowInviteDropdown] = useState(
    Boolean(inviteDefaults?.expandInviteSection),
  );

  const handleAction = async (action: ConnectionAction) => {
    if (!person) {
      return;
    }

    clearError();
    await runConnectionAction(action, person.userId);
  };

  const handleInvite = async () => {
    if (!person || !selectedProjectId || !resolvedRole) {
      return;
    }

    const selectedProject =
      inviteableProjects?.find((project) => project.id === selectedProjectId) ??
      null;
    const roleLabel = INVITE_ROLE_OPTIONS.find(
      (role) => role.value === resolvedRole,
    )?.label;

    if (!selectedProject || !roleLabel) {
      return;
    }

    setInviteError(null);
    setInviteMessage(null);
    setIsSubmittingInviteAction(true);

    try {
      if (inviteActionMode === "invite") {
        await inviteUserToProject({
          projectId: selectedProjectId,
          targetUserId: person.userId,
          role: resolvedRole,
        });
        setInviteMessage(
          `Invite sent to ${visiblePerson?.name ?? person.name} for ${selectedProject.name} as ${roleLabel}.`,
        );
      } else if (
        inviteActionMode === "upgrade" ||
        inviteActionMode === "downgrade"
      ) {
        await changeProjectMemberRole({
          projectId: selectedProjectId,
          targetUserId: person.userId,
          role: resolvedRole,
        });
        setInviteMessage(
          `Updated ${visiblePerson?.name ?? person.name} in ${selectedProject.name} to ${roleLabel.toLowerCase()}.`,
        );
      }
    } catch (inviteActionError) {
      setInviteError(
        inviteActionError instanceof Error
          ? inviteActionError.message
          : inviteActionMode === "invite"
            ? "Could not invite this user to the project."
            : "Could not update this project member.",
      );
    } finally {
      setIsSubmittingInviteAction(false);
    }
  };

  useEffect(() => {
    setSelectedProjectId(inviteDefaults?.projectId ?? "");
    setSelectedRole(inviteDefaults?.role ?? "client");
    setInviteMessage(null);
    setInviteError(null);
    setIsSubmittingInviteAction(false);
    setShowInviteDropdown(Boolean(inviteDefaults?.expandInviteSection));
  }, [inviteDefaults, person]);

  useEffect(() => {
    setInviteMessage(null);
    setInviteError(null);
  }, [selectedProjectId, selectedRole]);

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

  if (!open || !person || !visiblePerson) return null;

  const selectedProject =
    inviteableProjects?.find((project) => project.id === selectedProjectId) ??
    null;
  const canReceiveProjectInvite = Boolean(visiblePerson.email?.trim());
  const currentMembershipRole = selectedProjectMembership?.role ?? null;
  const inviteActionMode: ProjectInviteActionMode =
    !selectedProject || selectedProjectMembership === undefined
      ? "unavailable"
      : currentMembershipRole === null
        ? selectedRole
          ? "invite"
          : "unavailable"
        : currentMembershipRole === "owner"
          ? "unavailable"
          : currentMembershipRole === "client"
            ? "upgrade"
            : currentMembershipRole === "coCreator"
              ? "downgrade"
              : "unavailable";
  const resolvedRole: InviteRole | "" =
    inviteActionMode === "upgrade"
      ? "coCreator"
      : inviteActionMode === "downgrade"
        ? "client"
        : selectedRole;
  const inviteActionLabel =
    inviteActionMode === "upgrade"
      ? "Upgrade to co-creator"
      : inviteActionMode === "downgrade"
        ? "Downgrade to client"
        : "Invite";
  const inviteActionHelper = !selectedProject
    ? null
    : selectedProjectMembership === undefined
      ? "Loading project membership..."
      : currentMembershipRole === "owner"
        ? "The project owner's role cannot be changed here."
        : null;
  const canInvite =
    Boolean(selectedProject) &&
    Boolean(resolvedRole) &&
    !isSubmittingInviteAction &&
    (inviteableProjects?.length ?? 0) > 0 &&
    inviteActionMode !== "unavailable" &&
    (inviteActionMode !== "invite" || canReceiveProjectInvite);

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
              <Select
                value={selectedProjectId}
                onValueChange={(value) =>
                  setSelectedProjectId(value as Id<"projects">)
                }
              >
                <SelectTrigger className="w-full bg-(--qutie-dark) border-(--gray)">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent className="bg-(--quite-dark) border-none text-(--gray-page)">
                  <SelectGroup className="bg-(--quite-dark)">
                    {inviteableProjects?.map((project) => (
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

              {currentMembershipRole === null ? (
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
              ) : null}

              <button
                type="button"
                className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-(--vibrant)"
                disabled={!canInvite}
                onClick={() => void handleInvite()}
              >
                {isSubmittingInviteAction
                  ? inviteActionMode === "invite"
                    ? "Inviting..."
                    : "Updating..."
                  : inviteActionLabel}
              </button>

              {inviteableProjects === undefined ? (
                <p className="pt-2 text-(--gray-page)">Loading projects...</p>
              ) : null}
              {inviteableProjects !== undefined &&
              inviteableProjects.length === 0 ? (
                <p className="pt-2 text-(--gray-page)">
                  You can only invite people to projects where you are the owner
                  or a co-creator.
                </p>
              ) : null}
              {inviteActionMode === "invite" && !canReceiveProjectInvite ? (
                <p className="pt-2 text-(--gray-page)">
                  This account cannot receive a project invite until it has an
                  email address.
                </p>
              ) : null}
              {inviteActionHelper ? (
                <p
                  className={`pt-2 ${
                    selectedProjectMembership === undefined
                      ? "text-(--gray-page)"
                      : inviteActionMode === "unavailable"
                        ? "text-(--declined-border)"
                        : "text-(--gray-page)"
                  }`}
                >
                  {inviteActionHelper}
                </p>
              ) : null}
              {inviteMessage ? (
                <p className="pt-2 text-(--gray-page)">{inviteMessage}</p>
              ) : null}
              {inviteError ? (
                <p className="pt-2 text-(--declined-border)">{inviteError}</p>
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
                className="gap-1 text-(--gray-page) underline underline-offset-4 disabled:opacity-60 hover:text-(--gray) mr-auto"
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
                className="gap-1 text-(--gray-page) underline underline-offset-4 disabled:opacity-60 hover:text-(--gray) mr-auto"
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
                className="gap-1 text-(--gray-page) underline underline-offset-4 disabled:opacity-60 hover:text-(--gray) mr-auto"
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
                className="gap-1 text-(--gray-page) underline underline-offset-4 disabled:opacity-60 hover:text-(--gray) mr-auto"
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
