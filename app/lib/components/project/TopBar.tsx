"use client";
import {
  Cog,
  FilePlusCorner,
  Pencil,
  Presentation,
  Share,
  Trash,
} from "lucide-react";
import { useEditMode } from "./EditModeContext";

export const TopBar = () => {
  const { isEditing, isPresenting, setIsEditing, setIsPresenting } =
    useEditMode();
  const isConfig = !isEditing && !isPresenting;

  return (
    <div className="w-full border-b border-(--gray) flex items-center justify-start gap-2 p-1.5">
      <button
        onClick={() => setIsEditing(true)}
        className={`text-sm gap-1 flex items-center justify-center p-1 md:px-2 md:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) ${
          isEditing
            ? "bg-(--vibrant)/20 border-(--vibrant) text-(--light)"
            : "hover:bg-(--gray)/20"
        }`}
      >
        <Pencil size={15} />
        <span className="hidden md:inline">Edit</span>
      </button>
      <button
        onClick={() => {
          setIsEditing(false);
          setIsPresenting(false);
        }}
        className={`text-sm gap-1 flex items-center justify-center p-1 md:px-2 md:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) ${
          isConfig
            ? "bg-(--vibrant)/20 border-(--vibrant) text-(--light)"
            : "hover:bg-(--gray)/20"
        }`}
      >
        <Cog size={15} />
        <span className="hidden md:inline">Config</span>
      </button>
      <button
        onClick={() => setIsPresenting(true)}
        className={`text-sm gap-1 flex items-center justify-center p-1 md:px-2 md:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) ${
          isPresenting
            ? "bg-(--vibrant)/20 border-(--vibrant) text-(--light)"
            : "hover:bg-(--gray)/20"
        }`}
      >
        <Presentation size={15} />
        <span className="hidden md:inline">Preview</span>
      </button>
      <button className="text-sm gap-1 flex items-center justify-center p-1 md:px-2 md:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) hover:bg-(--gray)/20 ml-auto">
        <FilePlusCorner size={15} />
        <span className="hidden md:inline">New Page</span>
      </button>
      <button className="text-sm gap-1 flex items-center justify-center p-1 md:px-2 md:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) hover:bg-(--gray)/20">
        <Trash size={15} />
        <span className="hidden md:inline">Delete</span>
      </button>
      <button className="text-sm gap-1 flex items-center justify-center p-1 md:px-2 md:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) hover:bg-(--gray)/20">
        <Share size={15} />
        <span className="hidden md:inline">Save template</span>
      </button>
    </div>
  );
};
