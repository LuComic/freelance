"use client";

import { useState } from "react";

type radioOptionType = {
  id: number;
  label: string;
  selected: boolean;
};

const RADIO_OPTIONS: radioOptionType[] = [
  {
    id: 1,
    label: "Red",
    selected: true,
  },
  {
    id: 2,
    label: "Orange",
    selected: false,
  },
  {
    id: 3,
    label: "Yellow",
    selected: false,
  },
  {
    id: 4,
    label: "Green",
    selected: false,
  },
];

export const RadioPreview = () => {
  const [options, setOptions] = useState<radioOptionType[]>(RADIO_OPTIONS);

  const toggleOption = (id: number) => {
    const opt = options.find((o) => o.id === id);
    if (!opt) return;

    if (opt?.selected) {
      setOptions((prev) =>
        prev.map((o) => (o === opt ? { ...o, selected: false } : o)),
      );
    } else {
      setOptions((prev) =>
        prev.map((o) =>
          o === opt ? { ...o, selected: true } : { ...o, selected: false },
        ),
      );
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {options.map((option) => {
        const selected = option.selected;

        return (
          <button
            key={option.id}
            className="flex items-center gap-2 justify-start w-max"
            onClick={() => toggleOption(option.id)}
          >
            <span
              className={`h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-full bg-(--darkest) ${selected ? "border-(--vibrant) bg-(--vibrant)/10" : "border-(--gray) bg-(--gray)/10"} border`}
            >
              {selected && (
                <span className="bg-(--vibrant) aspect-square h-full rounded-full" />
              )}
            </span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
