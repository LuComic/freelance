"use client";
import { FilePlusCorner, Pencil, Trash } from "lucide-react";
import { useEditMode } from "./EditModeContext";

export const TopBar = () => {
  const { isEditing, toggleEditing } = useEditMode();

  return (
    <div className="w-full border-b border-(--gray) flex items-center justify-start gap-2 p-1.5">
      <button className="text-sm gap-1 flex items-center justify-center px-2 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) hover:bg-(--gray)/20">
        <FilePlusCorner size={15} />
        New Page
      </button>
      <button
        onClick={toggleEditing}
        className={`text-sm gap-1 flex items-center justify-center px-2 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) ${
          isEditing
            ? "bg-(--vibrant)/20 border-(--vibrant) text-(--light)"
            : "hover:bg-(--gray)/20"
        }`}
      >
        <Pencil size={15} />
        {isEditing ? "Editing" : "Edit"}
      </button>
      <button className="text-sm gap-1 flex items-center justify-center px-2 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) hover:bg-(--gray)/20">
        <Trash size={15} />
        Delete
      </button>
    </div>
  );
};
