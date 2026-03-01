"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { ChevronRight, Trash } from "lucide-react";
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
  onRemove: (userId: Id<"users">) => void;
  onManage: () => void;
  pendingRemovalUserId?: Id<"users"> | null;
  error?: string | null;
  canManage?: boolean;
  shaded?: boolean;
};

export function ProjectEmailListSection({
  title,
  currentLabel,
  manageLabel,
  members,
  onRemove,
  onManage,
  pendingRemovalUserId = null,
  error = null,
  canManage = true,
  shaded = false,
}: ProjectEmailListSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`${shaded ? "bg-(--gray)/10 " : ""}w-full p-2 flex flex-col gap-2`}
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
          <div className="flex items-center justify-start gap-2 w-full flex-wrap">
            {members.map((member) => (
              <div
                key={member.userId}
                className="pl-1.5 pr-0.5 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) flex items-center gap-1"
              >
                {member.name}
                <button
                  type="button"
                  disabled={!canManage || pendingRemovalUserId === member.userId}
                  className="hover:bg-(--gray)/20 p-1 rounded-sm"
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
          {error ? <p className="text-sm text-(--declined-border)">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
