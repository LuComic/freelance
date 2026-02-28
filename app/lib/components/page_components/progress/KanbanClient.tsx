"use client";

import type { PageComponentLiveStateByType } from "@/lib/pageDocument";

type KanbanClientProps = {
  liveState: PageComponentLiveStateByType<"Kanban">["state"];
};

export const KanbanClient = ({ liveState }: KanbanClientProps) => {
  const visibleData = liveState.items.filter((item) => !item.dismissed);

  const getTableData = (): (
    | (typeof liveState.items)[number]
    | undefined
  )[][] => {
    const todos = visibleData.filter((t) => t.status === "Todo");
    const progress = visibleData.filter((t) => t.status === "In Progress");
    const done = visibleData.filter((t) => t.status === "Done");
    const longest = Math.max(todos.length, progress.length, done.length);
    const tableList: ((typeof liveState.items)[number] | undefined)[][] = [];

    for (let i = 0; i < longest; i++) {
      tableList.push([todos[i], progress[i], done[i]]);
    }
    return tableList;
  };

  const tableRows = getTableData();

  return (
    <>
      <p className="@[40rem]:text-xl text-lg font-medium">Current Progress</p>
      <p className="text-(--gray-page)">
        Here you can display the progress of your work as a kanban list. The
        table is divided into &quot;Todo&quot; (features/things to do or fix),
        &quot;In progress&quot; (things that are currently being developed or
        fixed) and &quot;Done&quot; (list of the completed tasks).
      </p>
      <div className="w-full max-w-full min-w-0 overflow-x-auto border rounded-md border-(--gray)">
        <div className="min-w-[900px] flex flex-col">
          <div
            className={`w-full text-(--gray-page) ${tableRows.length > 0 && "border-b"} border-(--gray) text-left grid justify-between items-start grid-cols-3 bg-(--darkest)`}
          >
            <span className="text-(--declined-border) border-r p-2 border-(--gray) h-full text-wrap">
              Todo
            </span>
            <span className="p-2 border-r border-(--gray) h-full text-wrap">
              In Progress
            </span>
            <span className="text-(--accepted-border) text-wrap p-2 h-full">
              Done
            </span>
          </div>

          {tableRows.map((row, index) => (
            <div
              key={index}
              className={`w-full ${index !== tableRows.length - 1 && "border-b"} border-(--gray) text-left grid justify-between items-start grid-cols-3 ${index % 2 !== 0 && "bg-(--gray)/10"}`}
            >
              {row.map((item, i) => (
                <div
                  key={i}
                  className="p-2 border-r border-(--gray) last:border-r-0 h-full flex flex-col items-start justify-start gap-2 text-wrap"
                >
                  {item ? <span>{item.feature}</span> : <div />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
