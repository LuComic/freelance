"use client";

import { useState } from "react";

type OptionType = {
  id: number;
  label: string;
};

type SelectConfig = {
  title: string;
  description: string;
  options: OptionType[];
};

const SELECT_CONFIG: SelectConfig = {
  title: "Which package tier works for you?",
  description:
    "Pick one or more options from this select-style field. It supports multiple choices.",
  options: [
    { id: 1, label: "Starter" },
    { id: 2, label: "Growth" },
    { id: 3, label: "Enterprise" },
  ],
};

type SelectClientProps = {
  initialLayout?: "grid" | "list";
};

export const SelectClient = ({}: SelectClientProps) => {
  const [config] = useState(SELECT_CONFIG);
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>(
    config.options[0] ? [config.options[0].id] : [],
  );

  const toggleOption = (id: number) => {
    setSelectedOptionIds((prev) =>
      prev.includes(id)
        ? prev.filter((optionId) => optionId !== id)
        : [...prev, id],
    );
  };

  return (
    <>
      <p className="md:text-xl text-lg font-medium">{config.title}</p>
      <p className="text-(--gray-page)">{config.description}</p>
      <div className="w-full flex flex-col gap-2">
        {config.options.map((option) => {
          const selected = selectedOptionIds.includes(option.id);

          return (
            <button
              key={option.id}
              className={`flex items-center gap-2 justify-start w-full md:w-1/2 cursor-pointer border px-2 py-1.5 ${selected ? "border-(--vibrant) bg-(--vibrant)/10" : "border-(--gray) bg-(--gray)/10"} rounded-sm`}
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
    </>
  );
};
