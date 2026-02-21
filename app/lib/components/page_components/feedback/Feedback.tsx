"use client";

import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { FeedbackCreator } from "./FeedbackCreator";
import { FeedbackClient } from "./FeedbackClient";

type FeedbackProps = {
  initialClientLayout?: "grid" | "list";
  initialCreatorLayout?: "grid" | "list";
};

export const Feedback = ({
  initialClientLayout,
  initialCreatorLayout,
}: FeedbackProps) => {
  const { isPresenting } = useEditMode();

  return (
    <div className="w-full flex flex-col gap-2">
      {isPresenting ? (
        <FeedbackClient initialLayout={initialClientLayout} />
      ) : (
        <FeedbackCreator initialLayout={initialCreatorLayout} />
      )}
    </div>
  );
};
