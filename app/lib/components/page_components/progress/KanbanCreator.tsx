"use client";

import { useState } from "react";
import { ChevronRight, Trash } from "lucide-react";
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
  const [editingTodo, setEditingTodo] = useState(false);
  const [editingProgress, setEditingProgress] = useState(false);
  const [editingDone, setEditingDone] = useState(false);
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

  const handleStatusChange = (id: number, status: KanbanItem["status"]) => {
    onChangeLiveState((currentLiveState) => ({
      ...currentLiveState,
      items: currentLiveState.items.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    }));
  };

  const handleDeleteTask = (itemId: number) => {
    onChangeLiveState((currentLiveState) => ({
      ...currentLiveState,
      items: currentLiveState.items.filter((item) => item.id !== itemId),
    }));
  };

  const visibleData = liveState.items.filter((item) => !item.dismissed);
  const todoItems = visibleData.filter((item) => item.status === "Todo");
  const progressItems = visibleData.filter(
    (item) => item.status === "In Progress",
  );
  const doneItems = visibleData.filter((item) => item.status === "Done");

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
          className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2 w-full"
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
              className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
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
              <SelectTrigger className="w-full @[40rem]:w-52 bg-(--dim) border-(--gray-page)">
                <SelectValue placeholder="Set the status" />
              </SelectTrigger>
              <SelectContent className="bg-(--dim) border-none text-(--gray-page)">
                <SelectGroup className="bg-(--dim)">
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className="data-highlighted:bg-(--darkest) data-highlighted:text-(--light) "
                    >
                      {status}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="flex items-center justify-start gap-2 w-full flex-wrap">
              {config.tags.length > 0 ? (
                config.tags.map((tag) => (
                  <button
                    key={tag}
                    className={`max-w-full min-w-0 px-1.5 py-0.5 rounded-md border wrap-break-word ${!selectedTags.includes(tag) && "border-(--gray-page) text-(--gray-page)"} `}
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
          className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2 w-full"
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
              className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNewTag();
                }
              }}
            />
            <div className="flex items-center justify-start gap-2 w-full flex-wrap">
              {config.tags.map((tag) => (
                <div
                  key={tag}
                  className="max-w-full min-w-0 pl-1.5 pr-0.5 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) flex items-center gap-1 wrap-break-word"
                >
                  <span className="min-w-0 wrap-break-word">{tag}</span>
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

        <div className="w-full h-px bg-(--gray)" />

        <button
          className="@[40rem]:text-lg text-(--declined-border) text-base font-medium flex items-center justify-start gap-2 w-full"
          onClick={() => setEditingTodo((prev) => !prev)}
        >
          Todo
          <ChevronRight size={18} className={`${editingTodo && "rotate-90"}`} />
        </button>
        {editingTodo && (
          <>
            {todoItems.length > 0 ? (
              todoItems.map((item) => (
                <div
                  key={item.id}
                  className="w-full min-w-0 flex items-center justify-start gap-2 flex-wrap"
                >
                  <Select
                    value={item.status}
                    onValueChange={(value) =>
                      handleStatusChange(item.id, value as KanbanItem["status"])
                    }
                  >
                    <SelectTrigger className="w-max bg-(--dim) border-(--gray-page) h-6.5!">
                      <SelectValue placeholder="Set the status" />
                    </SelectTrigger>
                    <SelectContent className="bg-(--dim) border-none text-(--gray-page)">
                      <SelectGroup className="bg-(--dim)">
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="data-highlighted:bg-(--darkest) data-highlighted:text-(--light) h-6.5!"
                          >
                            {status}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <button
                    className="h-6.5 flex items-center justify-center aspect-square rounded-md hover:bg-(--darkest)/10 bg-(--dim) border-(--gray-page) border"
                    onClick={() => handleDeleteTask(item.id)}
                  >
                    <Trash size={16} />
                  </button>
                  <span className="min-w-0 wrap-break-word">
                    {item.feature}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-(--gray-page)">No tasks setup</span>
            )}
          </>
        )}

        <div className="w-full h-px bg-(--gray)" />

        <button
          className="@[40rem]:text-lg text-(--gray-page) text-base font-medium flex items-center justify-start gap-2 w-full"
          onClick={() => setEditingProgress((prev) => !prev)}
        >
          In Progress
          <ChevronRight
            size={18}
            className={`${editingProgress && "rotate-90"}`}
          />
        </button>
        {editingProgress && (
          <>
            {progressItems.length > 0 ? (
              progressItems.map((item) => (
                <div
                  key={item.id}
                  className="w-full min-w-0 flex items-center justify-start gap-2 flex-wrap"
                >
                  <Select
                    value={item.status}
                    onValueChange={(value) =>
                      handleStatusChange(item.id, value as KanbanItem["status"])
                    }
                  >
                    <SelectTrigger className="w-max bg-(--dim) border-(--gray-page) h-6.5!">
                      <SelectValue placeholder="Set the status" />
                    </SelectTrigger>
                    <SelectContent className="bg-(--dim) border-none text-(--gray-page)">
                      <SelectGroup className="bg-(--dim)">
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="data-highlighted:bg-(--darkest) data-highlighted:text-(--light) h-6.5!"
                          >
                            {status}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <button
                    className="h-6.5 flex items-center justify-center aspect-square rounded-md hover:bg-(--darkest)/10 bg-(--dim) border-(--gray-page) border"
                    onClick={() => handleDeleteTask(item.id)}
                  >
                    <Trash size={16} />
                  </button>
                  <span className="min-w-0 wrap-break-word">
                    {item.feature}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-(--gray-page)">No tasks setup</span>
            )}
          </>
        )}

        <div className="w-full h-px bg-(--gray)" />

        <button
          className="@[40rem]:text-lg text-(--accepted-border) text-base font-medium flex items-center justify-start gap-2 w-full"
          onClick={() => setEditingDone((prev) => !prev)}
        >
          Done
          <ChevronRight size={18} className={`${editingDone && "rotate-90"}`} />
        </button>
        {editingDone && (
          <>
            {doneItems.length > 0 ? (
              doneItems.map((item) => (
                <div
                  key={item.id}
                  className="w-full min-w-0 flex items-center justify-start gap-2 flex-wrap"
                >
                  <Select
                    value={item.status}
                    onValueChange={(value) =>
                      handleStatusChange(item.id, value as KanbanItem["status"])
                    }
                  >
                    <SelectTrigger className="w-max bg-(--dim) border-(--gray-page) h-6.5!">
                      <SelectValue placeholder="Set the status" />
                    </SelectTrigger>
                    <SelectContent className="bg-(--dim) border-none text-(--gray-page)">
                      <SelectGroup className="bg-(--dim)">
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="data-highlighted:bg-(--darkest) data-highlighted:text-(--light) h-6.5!"
                          >
                            {status}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <button
                    className="h-6.5 flex items-center justify-center aspect-square rounded-md hover:bg-(--darkest)/10 bg-(--dim) border-(--gray-page) border"
                    onClick={() => handleDeleteTask(item.id)}
                  >
                    <Trash size={16} />
                  </button>
                  <span className="min-w-0 wrap-break-word">
                    {item.feature}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-(--gray-page)">No tasks setup</span>
            )}
          </>
        )}
      </div>
    </>
  );
};
