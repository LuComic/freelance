"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
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
  const [client, setClient] = useState(false);

  return (
    <div className="w-full border-y border-(--gray)  py-2 flex flex-col gap-2">
      <div className="flex items-center justify-start gap-2">
        <Switch
          className="data-[state=checked]:bg-(--vibrant) data-[state=unchecked]:bg-(--dim) "
          onClick={() => setClient((prev) => !prev)}
        />
        {client ? "Client's view" : "Creator's view"}
      </div>
      {client ? (
        <FeedbackClient initialLayout={initialClientLayout} />
      ) : (
        <FeedbackCreator initialLayout={initialCreatorLayout} />
      )}
    </div>
  );
};
