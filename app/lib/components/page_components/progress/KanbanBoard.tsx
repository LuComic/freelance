"use client";

import type { KanbanItem } from "@/lib/pageDocument";

type KanbanBoardItem = Pick<
  KanbanItem,
  "id" | "feature" | "status" | "dismissed"
>;

function getTableRows(items: KanbanBoardItem[]) {
  const todos = items.filter((item) => item.status === "Todo");
  const progress = items.filter((item) => item.status === "In Progress");
  const done = items.filter((item) => item.status === "Done");
  const longest = Math.max(todos.length, progress.length, done.length);
  const rows: Array<Array<KanbanBoardItem | undefined>> = [];

  for (let index = 0; index < longest; index += 1) {
    rows.push([todos[index], progress[index], done[index]]);
  }

  return rows;
}

export const KanbanBoard = ({ items }: { items: KanbanBoardItem[] }) => {
  const tableRows = getTableRows(items);

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-auto border rounded-md border-(--gray)">
      <div className="min-w-225 flex flex-col">
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
            {row.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="p-2 border-r border-(--gray) last:border-r-0 h-full flex flex-col items-start justify-start gap-2 text-wrap"
              >
                {item ? <span>{item.feature}</span> : <div />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
