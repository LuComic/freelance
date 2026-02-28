"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";

type ProjectDangerSectionProps = {
  isLoading: boolean;
  isUnavailable: boolean;
  isDeletingProject: boolean;
  isDeleteConfirming: boolean;
  deleteError: string | null;
  onDelete: () => Promise<void>;
};

export function ProjectDangerSection({
  isLoading,
  isUnavailable,
  isDeletingProject,
  isDeleteConfirming,
  deleteError,
  onDelete,
}: ProjectDangerSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-(--gray)/10 w-full p-2 flex flex-col gap-2">
      <button
        type="button"
        className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
        onClick={() => setOpen((prev) => !prev)}
      >
        <ChevronRight
          size={20}
          className={`${open ? "rotate-90" : "rotate-0"}`}
        />
        Danger zone
      </button>

      {open ? (
        <div className="pl-7 flex flex-col gap-2 pb-2">
          <p className="text-(--gray-page)">Delete project</p>
          <button
            type="button"
            className="w-max rounded-md border px-2 py-1 border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20"
            onClick={() => void onDelete()}
            disabled={isLoading || isUnavailable || isDeletingProject}
          >
            {isDeletingProject
              ? "Deleting..."
              : isDeleteConfirming
                ? "Are you sure?"
                : "Delete project"}
          </button>
          {deleteError ? (
            <p className="text-sm text-(--declined-border)">{deleteError}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
