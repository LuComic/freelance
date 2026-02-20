"use client";

import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { SelectCreator } from "./SelectCreator";
import { SelectClient } from "./SelectClient";

type SelectProps = {
  initialClientLayout?: "grid" | "list";
  initialCreatorLayout?: "grid" | "list";
};

export const Select = ({
  initialClientLayout,
  initialCreatorLayout,
}: SelectProps) => {
  const { isPresenting } = useEditMode();

  return (
    <div className="w-full border-y border-(--gray) py-2 flex flex-col gap-2">
      {isPresenting ? (
        <SelectClient initialLayout={initialClientLayout} />
      ) : (
        <SelectCreator initialLayout={initialCreatorLayout} />
      )}
    </div>
  );
};
