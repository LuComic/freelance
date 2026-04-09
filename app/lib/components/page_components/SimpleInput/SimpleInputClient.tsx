"use client";

import type { PageComponentLiveStateByType } from "@/lib/pageDocument";
import { useState } from "react";
import { createSimpleInputEntry } from "./simpleInputEntries";

type SimpleInputClientProps = {
  liveState: PageComponentLiveStateByType<"SimpleInput">["state"];
  onChangeLiveState: (
    updater: (
      state: PageComponentLiveStateByType<"SimpleInput">["state"],
    ) => PageComponentLiveStateByType<"SimpleInput">["state"],
  ) => void;
};

export const SimpleInputClient = ({
  onChangeLiveState,
}: SimpleInputClientProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    const nextValue = inputValue.trim();

    if (nextValue === "") {
      return;
    }

    onChangeLiveState((currentState) => ({
      ...currentState,
      inputs: [...currentState.inputs, createSimpleInputEntry(nextValue)],
    }));
    setInputValue("");
  };

  return (
    <>
      <div className="border-(--gray) border-t pt-2 w-full flex flex-col gap-2">
        <input
          type="text"
          placeholder="This is what i think..."
          className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSubmit();
            }
          }}
        />

        <button
          className="w-max rounded-md py-1 px-2 bg-(--vibrant) hover:bg-(--vibrant-hover) "
          onClick={handleSubmit}
        >
          Send
        </button>
      </div>
    </>
  );
};
