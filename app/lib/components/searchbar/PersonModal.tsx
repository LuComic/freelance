"use client";

import { useCallback, useEffect } from "react";
import type { SearchPerson } from "./SearchBarData";
import { X } from "lucide-react";

type PersonModalProps = {
  person: SearchPerson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const PersonModal = ({
  person,
  open,
  onOpenChange,
}: PersonModalProps) => {
  const closeModal = useCallback(() => onOpenChange(false), [onOpenChange]);

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

  if (!open || !person) return null;

  return (
    <div
      className="fixed px-2 inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className="w-full max-h-[85vh] h-auto flex flex-col items-start justify-start gap-2 p-3 md:max-w-xl bg-(--darkest) rounded-xl overflow-y-auto border border-(--gray)"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-start justify-between gap-2">
          <div className="flex justify-between items-center w-full">
            <p className="md:text-3xl text-xl font-medium">{person.name}</p>
            <button
              onClick={closeModal}
              className="p-1 hover:bg-(--gray)/20 rounded-lg"
            >
              <X />
            </button>
          </div>
        </div>
        <p className="text-(--gray-page)">{person.subtitle}</p>
        <div className="w-full flex items-center gap-1">
          <button
            type="button"
            className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--vibrant) bg-(--vibrant)/10 hover:bg-(--vibrant)/20"
          >
            Send friend request
          </button>
          <button
            type="button"
            className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--gray) hover:bg-(--gray)/20"
          >
            Block
          </button>
          {/*
          <button type="button">Cancel</button>
          <button type="button">Decline</button>
          */}
        </div>
      </div>
    </div>
  );
};
