"use client";

import { useState } from "react";
import { ChevronRight, TimerReset, Trash, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  KanbanItem,
  PageComponentInstanceByType,
  PageComponentLiveStateByType,
} from "@/lib/pageDocument";

type KanbanCreatorProps = {
  config: PageComponentInstanceByType<"Kanban">["config"];
  liveState: PageComponentLiveStateByType<"Kanban">["state"];
  onChangeConfig: (
    updater: (
      config: PageComponentInstanceByType<"Kanban">["config"],
    ) => PageComponentInstanceByType<"Kanban">["config"],
  ) => void;
  onChangeLiveState: (
    updater: (
      state: PageComponentLiveStateByType<"Kanban">["state"],
    ) => PageComponentLiveStateByType<"Kanban">["state"],
  ) => void;
};

const STATUS_OPTIONS: KanbanItem["status"][] = ["Todo", "In Progress", "Done"];

export const KanbanCreator = ({
  config,
  liveState,
  onChangeConfig,
  onChangeLiveState,
}: KanbanCreatorProps) => {
  const [tagInput, setTagInput] = useState("");
  const [editingTags, setEditingTags] = useState(false);
  const [filter, setFilter] = useState<"" | "dismissed">("");
  const [adding, setAdding] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [newTaskStatus, setNewTaskStatus] =
    useState<KanbanItem["status"]>("Todo");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleNewTag = () => {
    if (tagInput.trim() === "") return;
    if (config.tags.includes(tagInput.trim())) return;
    onChangeConfig((currentConfig) => ({
      ...currentConfig,
      tags: [tagInput.trim(), ...currentConfig.tags],
    }));
    setTagInput("");
  };

  const deleteTag = (tag: string) => {
    onChangeConfig((currentConfig) => ({
      ...currentConfig,
      tags: currentConfig.tags.filter((t) => t !== tag),
    }));
    setSelectedTags((prev) =>
      prev.filter((selectedTag) => selectedTag !== tag),
    );
    onChangeLiveState((currentLiveState) => ({
      ...currentLiveState,
      items: currentLiveState.items.map((item) => ({
        ...item,
        tags: item.tags.filter((itemTag) => itemTag !== tag),
      })),
    }));
  };

  const handleNewTask = () => {
    if (taskInput.trim() === "") return;

    const highestId = liveState.items.reduce(
      (max, item) => Math.max(max, item.id),
      0,
    );

    onChangeLiveState((currentLiveState) => ({
      ...currentLiveState,
      items: [
        {
          id: highestId + 1,
          feature: taskInput.trim(),
          status: newTaskStatus,
          tags: selectedTags,
        },
        ...currentLiveState.items,
      ],
    }));
    setTaskInput("");
    setNewTaskStatus("Todo");
    setSelectedTags([]);
  };

  const handleDismissing = (itemId: number) => {
    onChangeLiveState((currentLiveState) => ({
      ...currentLiveState,
      items: currentLiveState.items.map((item) =>
        item.id === itemId ? { ...item, dismissed: !item.dismissed } : item,
      ),
    }));
  };

  const handleDeleteTask = (itemId: number) => {
    onChangeLiveState((currentLiveState) => ({
      ...currentLiveState,
      items: currentLiveState.items.filter((item) => item.id !== itemId),
    }));
  };

  const handleStatusChange = (id: number, status: KanbanItem["status"]) => {
    onChangeLiveState((currentLiveState) => ({
      ...currentLiveState,
      items: currentLiveState.items.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    }));
  };

  const changeFilter = () => {
    if (filter === "dismissed") {
      setFilter("");
      return;
    }

    setFilter("dismissed");
  };

  const visibleData = liveState.items.filter((item) => {
    if (filter === "dismissed") {
      return item.dismissed;
    }
    return !item.dismissed;
  });

  const getTableData = (): (KanbanItem | undefined)[][] => {
    const todos = visibleData.filter((t) => t.status === "Todo");
    const progress = visibleData.filter((t) => t.status === "In Progress");
    const done = visibleData.filter((t) => t.status === "Done");
    const longest = Math.max(todos.length, progress.length, done.length);
    const tableList: (KanbanItem | undefined)[][] = [];

    for (let i = 0; i < longest; i++) {
      tableList.push([todos[i], progress[i], done[i]]);
    }
    return tableList;
  };

  const tableRows = getTableData();

  return (
    <>
      <p className="@[40rem]:text-xl text-lg font-medium mt-2">
        Current Progress
      </p>
      <p className="text-(--gray-page)">
        Here you can display the progress of your work as a kanban table. The
        table is divided into &quot;Todo&quot; (features/things to do or fix),
        &quot;In progress&quot; (things that are currently being developed or
        fixed) and &quot;Done&quot; (list of the completed tasks).
      </p>
      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        <button
          className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2 w-max"
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
                setNewTaskStatus(value as KanbanItem["status"])
              }
            >
              <SelectTrigger className="w-full @[40rem]:w-52 bg-(--darkest) border-(--gray-page)">
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
            <div className="flex items-center justify-start gap-2 w-full">
              {config.tags.length > 0 ? (
                config.tags.map((tag) => (
                  <button
                    key={tag}
                    className={`px-1.5 py-0.5 rounded-md border ${!selectedTags.includes(tag) && "border-(--gray-page) text-(--gray-page)"} `}
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags((prev) =>
                          prev.filter((prevTag) => prevTag !== tag),
                        );
                      } else {
                        setSelectedTags((prev) => [...prev, tag]);
                      }
                    }}
                  >
                    {tag}
                  </button>
                ))
              ) : (
                <span className="text-(--gray-page)">No tags setup</span>
              )}
            </div>

            <button
              className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
              onClick={handleNewTask}
            >
              Add task
            </button>
          </>
        )}

        <div className="w-full h-px bg-(--gray)" />

        <button
          className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2 w-max"
          onClick={() => setEditingTags((prev) => !prev)}
        >
          Tags
          <ChevronRight size={18} className={`${editingTags && "rotate-90"}`} />
        </button>
        {editingTags && (
          <>
            <input
              type="text"
              placeholder="Add a new tag..."
              className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNewTag();
                }
              }}
            />
            <div className="flex items-center justify-start gap-2 w-full">
              {config.tags.map((tag) => (
                <div
                  key={tag}
                  className="pl-1.5 pr-0.5 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    className="hover:bg-(--gray)/20 p-1 rounded-sm"
                    onClick={() => deleteTag(tag)}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
              onClick={handleNewTag}
            >
              Add tag
            </button>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 @[40rem]:flex items-center justify-between @[40rem]:justify-start w-full gap-2">
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "dismissed" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
          onClick={() => changeFilter()}
        >
          <X size={16} />
          Dismissed ({liveState.items.filter((item) => item.dismissed).length})
        </button>
      </div>
      {filter === "dismissed" ? (
        <div
          className={`w-full flex flex-col @[40rem]:grid ${visibleData.length === 1 ? "grid-cols-[repeat(auto-fit,minmax(280px,500px))]" : "grid-cols-[repeat(auto-fit,minmax(280px,1fr))]"}  gap-2`}
        >
          {visibleData.map((feature) => (
            <div
              key={feature.id}
              className="rounded-md border px-2 gap-1 justify-between py-1.5 w-full min-w-0 flex flex-col min-h-0 border-(--gray) bg-(--gray)/10"
            >
              <span className="font-semibold">
                <span className="rounded-sm font-normal text-(--gray-page)">
                  {feature.tags.join(", ")} -{" "}
                </span>
                {feature.feature}
              </span>
              <div className="w-full flex items-center gap-1">
                <button
                  className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--gray)  hover:bg-(--gray)/20"
                  onClick={() => handleDeleteTask(feature.id)}
                >
                  <Trash size={16} />
                  Delete
                </button>
                <button
                  className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--gray)  hover:bg-(--gray)/20"
                  onClick={() => handleDismissing(feature.id)}
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
                            onClick={() => handleDismissing(item.id)}
                          >
                            <X size={16} />
                          </button>
                          <Select
                            value={item.status}
                            onValueChange={(value) =>
                              handleStatusChange(
                                item.id,
                                value as KanbanItem["status"],
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
                        <span>
                          <span className="text-(--gray-page)">
                            {item.tags.join(", ")} -{" "}
                          </span>
                          {item.feature}
                        </span>
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
      <div className="h-px w-full border-dashed border border-(--gray)"></div>
    </>
  );
};
