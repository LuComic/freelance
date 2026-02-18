"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
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
  const [client, setClient] = useState(false);

  return (
    <div className="w-full border-y border-(--gray) py-2 flex flex-col gap-2">
      <div className="flex items-center justify-start gap-2">
        <Switch
          className="data-[state=checked]:bg-(--vibrant) data-[state=unchecked]:bg-(--dim) cursor-pointer"
          onClick={() => setClient((prev) => !prev)}
        />
        {client ? "Client's view" : "Creator's view"}
      </div>
      {client ? (
        <RadioClient initialLayout={initialClientLayout} />
      ) : (
        <RadioCreator initialLayout={initialCreatorLayout} />
      )}
    </div>
  );
};
