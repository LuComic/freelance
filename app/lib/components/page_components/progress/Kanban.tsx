"use client";

import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { KanbanCreator } from "./KanbanCreator";
import { KanbanClient } from "./KanbanClient";

type KanbanProps = {
  initialClientLayout?: "grid" | "list";
  initialCreatorLayout?: "grid" | "list";
};

export const Kanban = ({
  initialClientLayout,
  initialCreatorLayout,
}: KanbanProps) => {
  const { isPresenting } = useEditMode();

  return (
    <div className="w-full border-y border-(--gray) py-2 flex flex-col gap-2">
      {isPresenting ? (
        <KanbanClient initialLayout={initialClientLayout} />
      ) : (
        <KanbanCreator initialLayout={initialCreatorLayout} />
      )}
    </div>
  );
};
