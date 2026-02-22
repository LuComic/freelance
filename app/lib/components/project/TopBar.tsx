"use client";
import { Cog, FilePlusCorner, Pencil, Radio, Share, Trash } from "lucide-react";
import { useEditMode } from "./EditModeContext";

export const TopBar = () => {
  const { isEditing, isLive, setIsEditing, setIsLive } = useEditMode();
  const isConfig = !isEditing && !isLive;

  return (
    <div className="w-full border-b border-(--gray) flex items-center justify-start gap-2 p-1.5">
      <button
        onClick={() => setIsEditing(true)}
        className={`text-sm gap-1 flex items-center justify-center p-1 lg:px-2 lg:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) ${
          isEditing
            ? "bg-(--vibrant)/20 border-(--vibrant) text-(--light)"
            : "hover:bg-(--gray)/20"
        }`}
      >
        <Pencil size={15} />
        <span className="hidden lg:inline">Edit</span>
      </button>
      <button
        onClick={() => {
          setIsEditing(false);
          setIsLive(false);
        }}
        className={`text-sm gap-1 flex items-center justify-center p-1 lg:px-2 lg:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) ${
          isConfig
            ? "bg-(--vibrant)/20 border-(--vibrant) text-(--light)"
            : "hover:bg-(--gray)/20"
        }`}
      >
        <Cog size={15} />
        <span className="hidden lg:inline">Config</span>
      </button>
      <button
        onClick={() => setIsLive(true)}
        className={`text-sm gap-1 flex items-center justify-center p-1 lg:px-2 lg:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) ${
          isLive
            ? "bg-(--vibrant)/20 border-(--vibrant) text-(--light)"
            : "hover:bg-(--gray)/20"
        }`}
      >
        <Radio size={15} />
        <span className="hidden lg:inline">Live</span>
      </button>
      <button className="text-sm gap-1 flex items-center justify-center p-1 lg:px-2 lg:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) hover:bg-(--gray)/20 ml-auto">
        <FilePlusCorner size={15} />
        <span className="hidden lg:inline">New Page</span>
      </button>
      <button className="text-sm gap-1 flex items-center justify-center p-1 lg:px-2 lg:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) hover:bg-(--gray)/20">
        <Trash size={15} />
        <span className="hidden lg:inline">Delete</span>
      </button>
      <button className="text-sm gap-1 flex items-center justify-center p-1 lg:px-2 lg:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) hover:bg-(--gray)/20">
        <Share size={15} />
        <span className="hidden lg:inline">Save template</span>
      </button>
    </div>
  );
};
