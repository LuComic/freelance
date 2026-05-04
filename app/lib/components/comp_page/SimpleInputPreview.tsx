"use client";

import { useState } from "react";

export const SimpleInputPreview = () => {
  const [inputValue, setInputValue] = useState("");

  const submitInput = () => {
    setInputValue("");
  };

  return (
    <div className="border-(--gray) w-full flex flex-col gap-2">
      <input
        type="text"
        placeholder="This is what i think..."
        className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            submitInput();
          }
        }}
      />

      <button
        type="button"
        className="w-max rounded-md py-1 px-2 bg-(--vibrant) hover:bg-(--vibrant-hover)"
        onClick={submitInput}
      >
        Send
      </button>
    </div>
  );
};
