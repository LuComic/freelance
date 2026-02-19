"use client";
import { FilePlusCorner, Pencil, Trash } from "lucide-react";
import { useState } from "react";

export const TopBar = () => {
  const [editing, setEditing] = useState(false);
  return (
    <div className="w-full border-b border-(--gray) flex items-center justify-start gap-2 p-1.5">
      <button className="text-sm gap-1 flex items-center justify-center px-2 py-0.5 rounded-md border border-(--gray) hover:bg-(--gray)/20">
        <FilePlusCorner size={15} />
        New Page
      </button>
      <button className="text-sm gap-1 flex items-center justify-center px-2 py-0.5 rounded-md border border-(--gray) hover:bg-(--gray)/20">
        <Pencil size={15} />
        Edit
      </button>
      <button className="text-sm gap-1 flex items-center justify-center px-2 py-0.5 rounded-md border border-(--gray) hover:bg-(--gray)/20">
        <Trash size={15} />
        Delete
      </button>
    </div>
  );
};
