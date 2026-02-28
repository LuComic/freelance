"use client";

import { useState } from "react";
import { ChevronRight, Trash } from "lucide-react";
import type {
  PageComponentInstanceByType,
  PageComponentLiveStateByType,
} from "@/lib/pageDocument";

type SelectCreatorProps = {
  config: PageComponentInstanceByType<"Select">["config"];
  liveState: PageComponentLiveStateByType<"Select">["state"];
  onChangeConfig: (
    updater: (
      config: PageComponentInstanceByType<"Select">["config"],
    ) => PageComponentInstanceByType<"Select">["config"],
  ) => void;
  onChangeLiveState: (
    updater: (
      state: PageComponentLiveStateByType<"Select">["state"],
    ) => PageComponentLiveStateByType<"Select">["state"],
  ) => void;
};

export const SelectCreator = ({
  config,
  liveState,
  onChangeConfig,
  onChangeLiveState,
}: SelectCreatorProps) => {
  const [optionInput, setOptionInput] = useState("");
  const [editing, setEditing] = useState(false);

  const handleNewOption = () => {
    if (optionInput.trim() === "") return;

    const highestId = config.options.reduce(
      (max, option) => Math.max(max, option.id),
      0,
    );
    const nextId = highestId + 1;
    onChangeConfig((currentConfig) => ({
      ...currentConfig,
      options: [
        { id: nextId, label: optionInput.trim() },
        ...currentConfig.options,
      ],
    }));
    setOptionInput("");
  };

  const deleteOption = (id: number) => {
    onChangeConfig((currentConfig) => ({
      ...currentConfig,
      options: currentConfig.options.filter((option) => option.id !== id),
    }));
    onChangeLiveState((currentLiveState) => ({
      ...currentLiveState,
      selectedOptionIds: currentLiveState.selectedOptionIds.filter(
        (optionId) => optionId !== id,
      ),
    }));
  };

  const toggleOption = (id: number) => {
    onChangeLiveState((currentLiveState) => ({
      ...currentLiveState,
      selectedOptionIds: currentLiveState.selectedOptionIds.includes(id)
        ? currentLiveState.selectedOptionIds.filter((optionId) => optionId !== id)
        : [...currentLiveState.selectedOptionIds, id],
    }));
  };

  return (
    <>
      <p className="@[40rem]:text-xl text-lg font-medium">Select field setup</p>
      <p className="text-(--gray-page)">
        Configure the title, description, and available choices for a
        select-style multi-choice component.
      </p>

      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        <button
          className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2  w-max"
          onClick={() => setEditing((prev) => !prev)}
        >
          Edit field
          <ChevronRight size={18} className={`${editing && "rotate-90"}`} />
        </button>

        {editing && (
          <>
            <input
              type="text"
              placeholder="Field title..."
              className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
              value={config.title}
              onChange={(e) =>
                onChangeConfig((currentConfig) => ({
                  ...currentConfig,
                  title: e.target.value,
                }))
              }
            />
            <input
              type="text"
              placeholder="Field description..."
              className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
              value={config.description}
              onChange={(e) =>
                onChangeConfig((currentConfig) => ({
                  ...currentConfig,
                  description: e.target.value,
                }))
              }
            />
            <input
              type="text"
              placeholder="Add a new option..."
              className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
              value={optionInput}
              onChange={(e) => setOptionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNewOption();
                }
              }}
            />

            <div className="flex items-center justify-start gap-2 w-full flex-wrap">
              {config.options.map((option) => (
                <div
                  key={option.id}
                  className="pl-1.5 pr-0.5 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) flex items-center gap-1"
                >
                  {option.label}
                  <button
                    type="button"
                    className=" hover:bg-(--gray)/20 p-1 rounded-sm"
                    onClick={() => deleteOption(option.id)}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) "
              onClick={handleNewOption}
            >
              Add
            </button>
          </>
        )}
      </div>

      <div className="w-full flex flex-col gap-2">
        <p className="font-medium">{config.title}</p>
        <p className="text-(--gray-page)">{config.description}</p>
        <div className="w-full flex flex-col gap-2">
          {config.options.map((option) => {
            const selected = liveState.selectedOptionIds.includes(option.id);

            return (
              <button
                key={option.id}
                className={`flex items-center gap-2 justify-start w-full @[40rem]:w-1/2  border px-2 py-1.5 ${selected ? "border-(--vibrant) bg-(--vibrant)/10" : "border-(--gray) bg-(--gray)/10"} rounded-sm`}
                onClick={() => toggleOption(option.id)}
              >
                <span className="h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-sm bg-(--darkest)">
                  {selected && (
                    <span className="bg-(--vibrant) aspect-square h-full rounded-xs" />
                  )}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
