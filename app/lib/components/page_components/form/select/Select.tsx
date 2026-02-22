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
  const { isLive } = useEditMode();

  return (
    <div className="w-full flex flex-col gap-2">
      {isLive ? (
        <SelectClient initialLayout={initialClientLayout} />
      ) : (
        <SelectCreator initialLayout={initialCreatorLayout} />
      )}
    </div>
  );
};
