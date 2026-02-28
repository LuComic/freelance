"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";

type ProjectGeneralSectionProps = {
  currentProjectName: string;
  isLoading: boolean;
  isUnavailable: boolean;
  nameDraft: string;
  setNameDraft: (value: string) => void;
  canSaveName: boolean;
  renameError: string | null;
  isSavingName: boolean;
  onRename: () => Promise<void>;
};

export function ProjectGeneralSection({
  currentProjectName,
  isLoading,
  isUnavailable,
  nameDraft,
  setNameDraft,
  canSaveName,
  renameError,
  isSavingName,
  onRename,
}: ProjectGeneralSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full p-2 flex flex-col gap-2">
      <button
        type="button"
        className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
        onClick={() => setOpen((prev) => !prev)}
      >
        <ChevronRight
          size={20}
          className={`${open ? "rotate-90" : "rotate-0"}`}
        />
        General
      </button>

      {open ? (
        <div className="pl-7 flex flex-col gap-2 pb-2">
          <p className="text-(--gray-page)">Project name</p>
          <div className="w-max rounded-md border px-2 py-1 border-(--gray)">
            {isLoading ? "Loading..." : currentProjectName || "Not set"}
          </div>

          <p className="text-(--gray-page)">Rename project</p>
          <input
            type="text"
            placeholder="Enter a new project name..."
            className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            disabled={isLoading || isUnavailable || isSavingName}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void onRename();
              }
            }}
          />
          <button
            type="button"
            className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-(--vibrant)"
            onClick={() => void onRename()}
            disabled={!canSaveName}
          >
            {isSavingName ? "Saving..." : "Save"}
          </button>
          {renameError ? (
            <p className="text-sm text-(--declined-border)">{renameError}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
