"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH } from "@/lib/inputLimits";

type ProjectGeneralSectionProps = {
  currentProjectName: string;
  currentProjectDescription: string;
  isLoading: boolean;
  isUnavailable: boolean;
  nameDraft: string;
  setNameDraft: (value: string) => void;
  descriptionDraft: string;
  setDescriptionDraft: (value: string) => void;
  canSaveName: boolean;
  canSaveDescription: boolean;
  renameError: string | null;
  descriptionError: string | null;
  isSavingName: boolean;
  isSavingDescription: boolean;
  onRename: () => Promise<void>;
  onSaveDescription: () => Promise<void>;
};

export function ProjectGeneralSection({
  currentProjectName,
  currentProjectDescription,
  isLoading,
  isUnavailable,
  nameDraft,
  setNameDraft,
  descriptionDraft,
  setDescriptionDraft,
  canSaveName,
  canSaveDescription,
  renameError,
  descriptionError,
  isSavingName,
  isSavingDescription,
  onRename,
  onSaveDescription,
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
          <div className="w-max font-medium">
            {isLoading ? "Loading..." : currentProjectName || "Not set"}
          </div>

          <p className="text-(--gray-page)">Rename project</p>
          <input
            type="text"
            placeholder="Enter a new project name..."
            className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
            value={nameDraft}
            maxLength={MAX_NAME_LENGTH}
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
          <div className="w-max font-medium">
            {isLoading ? "Loading..." : currentProjectDescription || "Not set"}
          </div>

          <p className="text-(--gray-page)">Change the description</p>
          <textarea
            rows={3}
            placeholder="Enter a project description..."
            className="rounded-md bg-(--dim) px-2 py-1.5 outline-none resize-none"
            value={descriptionDraft}
            maxLength={MAX_DESCRIPTION_LENGTH}
            onChange={(e) => setDescriptionDraft(e.target.value)}
            disabled={isLoading || isUnavailable || isSavingDescription}
          />
          <button
            type="button"
            className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-(--vibrant)"
            onClick={() => void onSaveDescription()}
            disabled={!canSaveDescription}
          >
            {isSavingDescription ? "Saving..." : "Save"}
          </button>
          {descriptionError ? (
            <p className="text-sm text-(--declined-border)">
              {descriptionError}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
