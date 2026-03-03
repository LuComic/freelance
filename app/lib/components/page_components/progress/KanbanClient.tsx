"use client";

import type { PageComponentLiveStateByType } from "@/lib/pageDocument";
import { KanbanBoard } from "./KanbanBoard";

type KanbanClientProps = {
  liveState: PageComponentLiveStateByType<"Kanban">["state"];
};

export const KanbanClient = ({ liveState }: KanbanClientProps) => {
  const visibleData = liveState.items.filter((item) => !item.dismissed);

  return (
    <>
      <p className="@[40rem]:text-xl text-lg font-medium">Current Progress</p>
      <p className="text-(--gray-page)">
        Here you can display the progress of your work as a kanban list. The
        table is divided into &quot;Todo&quot; (features/things to do or fix),
        &quot;In progress&quot; (things that are currently being developed or
        fixed) and &quot;Done&quot; (list of the completed tasks).
      </p>
      <KanbanBoard items={visibleData} />
    </>
  );
};
