"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TEMPLATE_PAGE = {
  title: "Preferences",
  description: "Get the basic client's preferences and info",
  components: ["Select", "Select", "Radio"],
};

type SaveTemplateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const SaveTemplateModal = ({
  open,
  onOpenChange,
}: SaveTemplateModalProps) => {
  const [templateName, setTemplateName] = useState(
    "Freelance Website Template",
  );
  const [visibility, setVisibility] = useState<"private" | "public">("private");

  const closeModal = () => onOpenChange(false);

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
  }, [open]);

  if (!open) return null;

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
          <div className="flex flex-col gap-1">
            <p className="md:text-3xl text-xl font-medium">Save Template</p>
            <p className="text-(--gray-page)">
              Save this page structure as a reusable template.
            </p>
          </div>
        </div>

        <div className="w-full border-y border-(--gray) py-3 flex flex-col gap-2">
          <p className="text-(--gray-page)">Template name</p>
          <input
            type="text"
            className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
            placeholder="Template name..."
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />

          <p className="text-(--gray-page)">Visibility</p>
          <Select
            value={visibility}
            onValueChange={(value) =>
              setVisibility(value as "private" | "public")
            }
          >
            <SelectTrigger className="w-full bg-(--qutie-dark) border-(--gray)">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent className="bg-(--quite-dark) border-none text-(--gray-page)">
              <SelectGroup className="bg-(--quite-dark)">
                <SelectItem
                  value="private"
                  className="data-highlighted:bg-(--darkest-hover) data-highlighted:text-(--light)"
                >
                  Private
                </SelectItem>
                <SelectItem
                  value="public"
                  className="data-highlighted:bg-(--darkest-hover) data-highlighted:text-(--light)"
                >
                  Public
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full p-2 flex flex-col gap-2">
          <div className="w-full flex flex-col gap-2">
            <p className="font-medium">{TEMPLATE_PAGE.title}</p>
            <p className="text-(--gray-page)">{TEMPLATE_PAGE.description}</p>
            <div className="pt-1 flex items-center justify-start gap-2 w-full flex-wrap">
              {TEMPLATE_PAGE.components.map((componentName, componentIndex) => (
                <div
                  key={`${componentName}-${componentIndex}`}
                  className="px-2 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page)"
                >
                  {componentName}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full flex items-center gap-1 mt-1">
          <button
            type="button"
            className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--gray) hover:bg-(--gray)/20"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            type="button"
            className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--vibrant) bg-(--vibrant)/10 hover:bg-(--vibrant)/20"
            onClick={closeModal}
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};
