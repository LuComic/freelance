"use client";

import { useState } from "react";

type itemType = {
  id: number;
  feature: string;
  status: "Todo" | "In Progress" | "Done";
  dismissed?: boolean;
};

const IDEA_DATA: itemType[] = [
  {
    id: 1,
    feature: "Please add an About page",
    status: "Todo",
  },
  {
    id: 2,
    feature: "Turn the selector in X page into a slider",
    status: "In Progress",
  },
  {
    id: 3,
    feature:
      "Create a 3D animation on the landing page that is 4k resolution and has no mistakes",
    status: "Done",
  },
  {
    id: 4,
    feature: "Do something like that now!",
    status: "In Progress",
  },
  {
    id: 5,
    feature: "Finish the project in the next week!!!!",
    status: "In Progress",
  },
  {
    id: 6,
    feature:
      "Create a 3D animation on the landing page that is 4k resolution and has no mistakes",
    status: "Done",
  },
];

type KanbanClientProps = {
  initialLayout?: "grid" | "list";
};

export const KanbanClient = ({}: KanbanClientProps) => {
  const [data] = useState(IDEA_DATA);

  const visibleData = data.filter((item) => !item.dismissed);

  const getTableData = (): (itemType | undefined)[][] => {
    const todos = visibleData.filter((t) => t.status === "Todo");
    const progress = visibleData.filter((t) => t.status === "In Progress");
    const done = visibleData.filter((t) => t.status === "Done");
    const longest = Math.max(todos.length, progress.length, done.length);
    const tableList: (itemType | undefined)[][] = [];
    for (let i = 0; i < longest; i++) {
      tableList.push([todos[i], progress[i], done[i]]);
    }
    return tableList;
  };

  const tableRows = getTableData();

  return (
    <>
      <p className="md:text-xl text-lg font-medium">Current Progress</p>
      <p className="text-(--gray-page)">
        Here you can display the progress of your work as a kanban list. The
        table is divided into &quot;Todo&quot; (features/things to do or fix),
        &quot;In progress&quot; (things that are currently being developed or
        fixed) and &quot;Done&quot; (list of the completed tasks).
      </p>
      <div className="w-full max-w-full min-w-0 overflow-x-auto">
        <div className="min-w-[800px] flex flex-col">
          <div className="w-full text-(--gray-page) border-b border-(--gray) text-left grid justify-between items-start grid-cols-3 bg-(--darkest)">
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
