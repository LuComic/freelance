"use client";

import { useState } from "react";

type OptionType = {
  id: number;
  label: string;
};

type RadioConfig = {
  title: string;
  description: string;
  options: OptionType[];
};

const RADIO_CONFIG: RadioConfig = {
  title: "What should be prioritized first?",
  description:
    "Pick one option. This simulates how a client can cast one vote in a radio-style field.",
  options: [
    { id: 1, label: "Required" },
    { id: 2, label: "Nice to have" },
    { id: 3, label: "Not needed" },
  ],
};

type RadioClientProps = {
  initialLayout?: "grid" | "list";
};

export const RadioClient = ({}: RadioClientProps) => {
  const [config] = useState(RADIO_CONFIG);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(
    config.options[0]?.id ?? null,
  );

  return (
    <>
      <p className="md:text-xl text-lg font-medium">{config.title}</p>
      <p className="text-(--gray-page)">{config.description}</p>
      <div className="border-(--gray) border-t pt-2 w-full flex flex-col gap-2">
        {config.options.map((option) => {
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
    </>
  );
};
