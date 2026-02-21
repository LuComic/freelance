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
  const { isPresenting } = useEditMode();

  return (
    <div className="w-full flex flex-col gap-2">
      {isPresenting ? (
        <RadioClient initialLayout={initialClientLayout} />
      ) : (
        <RadioCreator initialLayout={initialCreatorLayout} />
      )}
    </div>
  );
};
