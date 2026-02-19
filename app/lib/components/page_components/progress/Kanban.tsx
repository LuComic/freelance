"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
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
  const [client, setClient] = useState(false);

  return (
    <div className="w-full border-y border-(--gray) py-2 flex flex-col gap-2">
      <div className="flex items-center justify-start gap-2">
        <Switch
          className="data-[state=checked]:bg-(--vibrant) data-[state=unchecked]:bg-(--dim) "
          onClick={() => setClient((prev) => !prev)}
        />
        {client ? "Client's view" : "Creator's view"}
      </div>
      {client ? (
        <KanbanClient initialLayout={initialClientLayout} />
      ) : (
        <KanbanCreator initialLayout={initialCreatorLayout} />
      )}
    </div>
  );
};
