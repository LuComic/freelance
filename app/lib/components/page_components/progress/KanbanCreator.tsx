"use client";

import { useState, useEffect } from "react";
import { TimerReset, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type itemType = {
  feature: string;
  status: "Todo" | "In Progress" | "Done";
  dismissed?: boolean;
};

let IDEA_DATA: itemType[] = [
  {
    feature: "Please add an About page",
    status: "Todo",
  },
  {
    feature: "Turn the selector in X page into a slider",
    status: "In Progress",
  },
  {
    feature:
      "Create a 3D animation on the landing page that is 4k resolution and has no mistakes",
    status: "Done",
  },
  {
    feature: "Do something like that now!",
    status: "In Progress",
  },
  {
    feature: "Finish the project in the next week!!!!",
    status: "In Progress",
  },
  {
    feature:
      "Create a 3D animation on the landing page that is 4k resolution and has no mistakes",
    status: "Done",
  },
];

export const KanbanCreator = () => {
  const [data, setData] = useState(IDEA_DATA);
  const [filter, setFilter] = useState<"" | "dismissed">("");

  const handleDismissing = (item: itemType) => {
    setData((prev) =>
      prev.map((p) =>
        p.feature === item.feature ? { ...p, dismissed: !p.dismissed } : p,
      ),
    );
  };

  const changeFilter = () => {
    if (filter === "dismissed") {
      setFilter("");
      return;
    }

    setFilter("dismissed");
  };

  const visibleData = data.filter((item) => {
    if (filter === "dismissed") {
      return item.dismissed;
    }
    // By default show only non‑dismissed items
    return !item.dismissed;
  });

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
        table is divided into "Todo" (features/things to do or fix), "In
        progress" (things that are currently being developed or fixed) and
        "Done" (list of the completed tasks).
      </p>
      <div className="grid grid-cols-2 md:flex items-center justify-between md:justify-start w-full gap-2">
        <button
          className={`flex items-center justify-center gap-1 w-full md:w-max rounded-md px-2.5 py-1 border ${filter !== "dismissed" && "text-(--gray-page) border-(--gray-page)"} cursor-pointer hover:bg-(--gray)/20`}
          onClick={() => changeFilter()}
        >
          <X size={16} />
          Dismissed ({data.filter((item) => item.dismissed).length})
        </button>
      </div>
      {filter === "dismissed" ? (
        <div
          className={`w-full flex flex-col md:grid ${visibleData.length === 1 ? "grid-cols-[repeat(auto-fit,minmax(280px,500px))]" : "grid-cols-[repeat(auto-fit,minmax(280px,1fr))]"}  gap-2`}
        >
          {visibleData.map((feature) => (
            <div
              key={feature.feature}
              className="rounded-md border px-2 gap-1 justify-between py-1.5 w-full min-w-0 flex flex-col min-h-0 border-(--gray) bg-(--gray)/10"
            >
              <span className="font-semibold">{feature.feature}</span>
              <div className="w-full flex items-center gap-1">
                <button
                  className="gap-1 flex items-center justify-center px-2.5 py-1 rounded-sm  w-full border border-(--gray) cursor-pointer hover:bg-(--gray)/20"
                  onClick={() => handleDismissing(feature)}
                >
                  <TimerReset size={16} />
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
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
                    {item ? (
                      <>
                        <div className="flex items-center gap-2">
                          <button
                            className="flex items-center justify-center p-1.5 rounded-sm cursor-pointer hover:bg-(--gray)/20 text-(--gray-page)"
                            onClick={() => handleDismissing(item)}
                          >
                            <X size={16} />
                          </button>
                          <Select value={item.status}>
                            <SelectTrigger className="w-max-w-48 border-none bg-(--darkest) cursor-pointer px-2">
                              <SelectValue placeholder="Set the status" />
                            </SelectTrigger>
                            <SelectContent className="bg-(--darkest) border-none text-(--gray-page)">
                              <SelectGroup className="bg-(--darkest)">
                                <SelectItem
                                  value="Todo"
                                  textValue={item.status}
                                  className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) cursor-pointer"
                                >
                                  Todo
                                </SelectItem>
                                <SelectItem
                                  value="In Progress"
                                  className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) cursor-pointer"
                                >
                                  In Progress
                                </SelectItem>
                                <SelectItem
                                  value="Done"
                                  className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) cursor-pointer"
                                >
                                  Done
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <span>{item.feature}</span>
                      </>
                    ) : (
                      <div />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
