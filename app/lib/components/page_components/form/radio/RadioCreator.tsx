"use client";

import { useState } from "react";
import { ChevronRight, Trash } from "lucide-react";

type OptionType = {
  id: number;
  label: string;
};

const DEFAULT_OPTIONS: OptionType[] = [
  { id: 1, label: "Required" },
  { id: 2, label: "Nice to have" },
];

type RadioCreatorProps = {
  initialLayout?: "grid" | "list";
};

export const RadioCreator = ({}: RadioCreatorProps) => {
  const [title, setTitle] = useState("What should be prioritized first?");
  const [description, setDescription] = useState(
    "Pick one option. This simulates how a client can cast one vote in a radio-style field.",
  );
  const [options, setOptions] = useState<OptionType[]>(DEFAULT_OPTIONS);
  const [optionInput, setOptionInput] = useState("");
  const [editing, setEditing] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(
    DEFAULT_OPTIONS[0]?.id ?? null,
  );

  const handleNewOption = () => {
    if (optionInput.trim() === "") return;

    const highestId = options.reduce(
      (max, option) => Math.max(max, option.id),
      0,
    );
    const nextId = highestId + 1;
    setOptions((prev) => [{ id: nextId, label: optionInput.trim() }, ...prev]);
    setSelectedOptionId(nextId);
    setOptionInput("");
  };

  const deleteOption = (id: number) => {
    setOptions((prev) => prev.filter((option) => option.id !== id));
    if (selectedOptionId === id) {
      const fallbackId = options.find((option) => option.id !== id)?.id ?? null;
      setSelectedOptionId(fallbackId);
    }
  };

  return (
    <>
      <p className="md:text-xl text-lg font-medium">Radio field setup</p>
      <p className="text-(--gray-page)">
        Configure the title, description, and available choices for a
        single-choice radio component.
      </p>

      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        <button
          className="md:text-lg text-base font-medium flex items-center justify-start gap-2  w-max"
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Field description..."
              className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              {options.map((option) => (
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
              className="w-max rounded-md px-2.5 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) "
              onClick={handleNewOption}
            >
              Submit
            </button>
          </>
        )}
      </div>

      <div className="w-full flex flex-col gap-2">
        <p className="font-medium">{title}</p>
        <p className="text-(--gray-page)">{description}</p>
        <div className="w-full flex flex-col gap-2">
          {options.map((option) => {
            const selected = selectedOptionId === option.id;

            return (
              <button
                key={option.id}
                className="flex items-center gap-2 justify-start w-full "
                onClick={() => setSelectedOptionId(option.id)}
              >
                <span className="h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-full bg-(--darkest)">
                  {selected && (
                    <span className="bg-(--vibrant) aspect-square h-full rounded-full" />
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
