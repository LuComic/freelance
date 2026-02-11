"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { FeedbackCreator } from "./FeedbackCreator";
import { FeedbackClient } from "./FeedbackClient";

export const Feedback = () => {
  const [client, setClient] = useState(false);

  return (
    <div className="w-full border border-(--gray) rounded-xl px-2 py-2 flex flex-col gap-2">
      <div className="flex items-center justify-start gap-2">
        <Switch
          className="data-[state=checked]:bg-(--vibrant) data-[state=unchecked]:bg-(--dim) cursor-pointer"
          onClick={() => setClient((prev) => !prev)}
        />
        {client ? "Client's view" : "Creator's view"}
      </div>
      {client ? <FeedbackClient /> : <FeedbackCreator />}
    </div>
  );
};
