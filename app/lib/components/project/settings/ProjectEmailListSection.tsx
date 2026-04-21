"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { ChevronRight, Dices, Trash } from "lucide-react";
import { useState } from "react";

type ProjectMemberListItem = {
  userId: Id<"users">;
  name: string;
};

type ProjectEmailListSectionProps = {
  title: string;
  currentLabel: string;
  manageLabel: string;
  members: ProjectMemberListItem[];
  joinCode?: string | null;
  onRemove: (userId: Id<"users">) => void;
  onManage: () => void;
  onRegenerateJoinCode?: () => void;
  pendingRemovalUserId?: Id<"users"> | null;
  error?: string | null;
  canCopyJoinCode?: boolean;
  canRegenerateJoinCode?: boolean;
  isRegeneratingJoinCode?: boolean;
  canManage?: boolean;
  canRemove?: boolean;
  showJoinAccess?: boolean;
  shaded?: boolean;
};

function buildProjectJoinLink(joinCode: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const url = new URL("/projects", window.location.origin);
  url.searchParams.set("joinCode", joinCode);
  return url.toString();
}

export function ProjectEmailListSection({
  title,
  currentLabel,
  manageLabel,
  members,
  joinCode = null,
  onRemove,
  onManage,
  onRegenerateJoinCode,
  pendingRemovalUserId = null,
  error = null,
  canCopyJoinCode = false,
  canRegenerateJoinCode = false,
  isRegeneratingJoinCode = false,
  canManage = true,
  canRemove = true,
  showJoinAccess = false,
  shaded = false,
}: ProjectEmailListSectionProps) {
  const [open, setOpen] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState<"code" | "link" | null>(
    null,
  );
  const [hoverCode, setHoverCode] = useState(false);
  const [hoverLink, setHoverLink] = useState(false);

  return (
    <div
      className={`${shaded ? "bg-(--gray)/10" : ""} w-full p-2 flex flex-col gap-2`}
    >
      <button
        type="button"
        className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
        onClick={() => setOpen((prev) => !prev)}
      >
        <ChevronRight
          size={20}
          className={`${open ? "rotate-90" : "rotate-0"}`}
        />
        {title}
      </button>

      {open ? (
        <div className="pl-7 flex flex-col gap-2 pb-2">
          <p className="text-(--gray-page)">{currentLabel}</p>
          {showJoinAccess ? (
            <>
              <div className="flex items-center justify-start gap-2 h-auto">
                <p className="text-(--gray-page)">Join code (click to copy):</p>
                <button
                  type="button"
                  disabled={!joinCode || !canCopyJoinCode}
                  className="font-medium"
                  onClick={async () => {
                    if (!joinCode || !canCopyJoinCode) {
                      return;
                    }

                    await navigator.clipboard.writeText(joinCode);
                    setCopiedTarget("code");
                    setTimeout(() => {
                      setCopiedTarget((target) =>
                        target === "code" ? null : target,
                      );
                    }, 1500);
                  }}
                  onMouseEnter={() => setHoverCode(true)}
                  onMouseLeave={() => setHoverCode(false)}
                >
                  <span className="italic">
                    {copiedTarget === "code"
                      ? "Copied"
                      : hoverCode
                        ? (joinCode ?? "Loading...")
                        : "******"}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={!canRegenerateJoinCode || isRegeneratingJoinCode}
                  className="p-1 rounded-md hover:bg-(--gray-page)/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  onClick={() => onRegenerateJoinCode?.()}
                >
                  <Dices size={18} />
                </button>
              </div>

              <div className="flex items-center justify-start gap-2 h-auto">
                <p className="text-(--gray-page)">Join link (click to copy):</p>
                <button
                  type="button"
                  disabled={!joinCode || !canCopyJoinCode}
                  className="font-medium"
                  onClick={async () => {
                    if (!joinCode || !canCopyJoinCode) {
                      return;
                    }

                    const joinLink = buildProjectJoinLink(joinCode);

                    if (!joinLink) {
                      return;
                    }

                    await navigator.clipboard.writeText(joinLink);
                    setCopiedTarget("link");
                    setTimeout(() => {
                      setCopiedTarget((target) =>
                        target === "link" ? null : target,
                      );
                    }, 1500);
                  }}
                  onMouseEnter={() => setHoverLink(true)}
                  onMouseLeave={() => setHoverLink(false)}
                >
                  <span className="italic">
                    {copiedTarget === "link"
                      ? "Copied"
                      : hoverLink
                        ? joinCode
                          ? (buildProjectJoinLink(joinCode) ?? "Loading...")
                          : "Loading..."
                        : "************"}
                  </span>
                </button>
              </div>
            </>
          ) : null}
          <div className="flex items-center justify-start gap-2 w-full flex-wrap">
            {members.map((member) => (
              <div
                key={member.userId}
                className="pl-1.5 pr-0.5 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) flex items-center gap-1"
              >
                {member.name}
                <button
                  type="button"
                  disabled={
                    !canRemove || pendingRemovalUserId === member.userId
                  }
                  className="hover:bg-(--gray)/20 p-1 rounded-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  onClick={() => onRemove(member.userId)}
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={!canManage}
            className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-(--vibrant)"
            onClick={onManage}
          >
            {manageLabel}
          </button>
          {error ? (
            <p className="text-sm text-(--declined-border)">{error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
