"use client";

import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { RadioCreator } from "./RadioCreator";
import { RadioClient } from "./RadioClient";

type RadioProps = {
  initialClientLayout?: "grid" | "list";
  initialCreatorLayout?: "grid" | "list";
};

export const Radio = ({
  initialClientLayout,
  initialCreatorLayout,
}: RadioProps) => {
  const { isLive } = useEditMode();

  return (
    <div className="w-full flex flex-col gap-2">
      {isLive ? (
        <RadioClient initialLayout={initialClientLayout} />
      ) : (
        <RadioCreator initialLayout={initialCreatorLayout} />
      )}
    </div>
  );
};
