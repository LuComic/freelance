"use client";

import { useState } from "react";
import { ChevronRight, TimerReset, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type KanbanCreatorProps = {
  initialLayout?: "grid" | "list";
};

const STATUS_OPTIONS: itemType["status"][] = ["Todo", "In Progress", "Done"];

export const KanbanCreator = ({}: KanbanCreatorProps) => {
  const [data, setData] = useState(IDEA_DATA);
  const [filter, setFilter] = useState<"" | "dismissed">("");
  const [adding, setAdding] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [newTaskStatus, setNewTaskStatus] =
    useState<itemType["status"]>("Todo");

  const handleNewTask = () => {
    if (taskInput.trim() === "") return;

    const highestId = data.reduce((max, item) => Math.max(max, item.id), 0);

    setData((prev) => [
      {
        id: highestId + 1,
        feature: taskInput.trim(),
        status: newTaskStatus,
      },
      ...prev,
    ]);
    setTaskInput("");
    setNewTaskStatus("Todo");
  };

  const handleDismissing = (item: itemType) => {
    setData((prev) =>
      prev.map((p) =>
        p.id === item.id ? { ...p, dismissed: !p.dismissed } : p,
      ),
    );
  };

  const handleStatusChange = (id: number, status: itemType["status"]) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
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
        table is divided into &quot;Todo&quot; (features/things to do or fix),
        &quot;In progress&quot; (things that are currently being developed or
        fixed) and &quot;Done&quot; (list of the completed tasks).
      </p>
      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        <button
          className="md:text-lg text-base font-medium flex items-center justify-start gap-2  w-max"
          onClick={() => setAdding((prev) => !prev)}
        >
          New Task
          <ChevronRight size={18} className={`${adding && "rotate-90"}`} />
        </button>
        {adding && (
          <>
            <input
              type="text"
              placeholder="Add a task to the board..."
              className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
              onChange={(e) => setTaskInput(e.target.value)}
              value={taskInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNewTask();
                }
              }}
            />

            <Select
              value={newTaskStatus}
              onValueChange={(value) =>
                setNewTaskStatus(value as itemType["status"])
              }
            >
              <SelectTrigger className="w-full md:w-52 bg-(--darkest) border-(--gray-page) ">
                <SelectValue placeholder="Set the status" />
              </SelectTrigger>
              <SelectContent className="bg-(--darkest) border-none text-(--gray-page)">
                <SelectGroup className="bg-(--darkest)">
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) "
                    >
                      {status}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <button
              className="w-max rounded-md px-2.5 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) "
              onClick={handleNewTask}
            >
              Submit
            </button>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 md:flex items-center justify-between md:justify-start w-full gap-2">
        <button
          className={`flex items-center justify-center gap-1 w-full md:w-max rounded-md px-2.5 py-1 border ${filter !== "dismissed" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
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
              key={feature.id}
              className="rounded-md border px-2 gap-1 justify-between py-1.5 w-full min-w-0 flex flex-col min-h-0 border-(--gray) bg-(--gray)/10"
            >
              <span className="font-semibold">{feature.feature}</span>
              <div className="w-full flex items-center gap-1">
                <button
                  className="gap-1 flex items-center justify-center px-2.5 py-1 rounded-sm  w-full border border-(--gray)  hover:bg-(--gray)/20"
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
        <div className="w-full max-w-full min-w-0 overflow-x-auto border rounded-md border-(--gray)">
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
                            className="flex items-center justify-center p-1.5 rounded-sm  hover:bg-(--gray)/20 text-(--gray-page)"
                            onClick={() => handleDismissing(item)}
                          >
                            <X size={16} />
                          </button>
                          <Select
                            value={item.status}
                            onValueChange={(value) =>
                              handleStatusChange(
                                item.id,
                                value as itemType["status"],
                              )
                            }
                          >
                            <SelectTrigger className="w-max-w-48 border-none bg-(--darkest)  px-2">
                              <SelectValue placeholder="Set the status" />
                            </SelectTrigger>
                            <SelectContent className="bg-(--darkest) border-none text-(--gray-page)">
                              <SelectGroup className="bg-(--darkest)">
                                {STATUS_OPTIONS.map((status) => (
                                  <SelectItem
                                    key={status}
                                    value={status}
                                    className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) "
                                  >
                                    {status}
                                  </SelectItem>
                                ))}
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
