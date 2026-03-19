"use client";

import { useState } from "react";
import type { PageComponentLiveStateByType } from "@/lib/pageDocument";

type IdeaFormCreatorProps = {
  liveState: PageComponentLiveStateByType<"IdeaForm">["state"];
  onChangeLiveState: (
    updater: (
      state: PageComponentLiveStateByType<"IdeaForm">["state"],
    ) => PageComponentLiveStateByType<"IdeaForm">["state"],
  ) => void;
};

function createIdeaId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `idea_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export const IdeaFormCreator = ({
  liveState,
  onChangeLiveState,
}: IdeaFormCreatorProps) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          const text = inputValue.trim();
          if (!text) {
            return;
          }

          onChangeLiveState((currentState) => ({
            ...currentState,
            ideas: [
              ...currentState.ideas,
              {
                id: createIdeaId(),
                text,
                color:
                  selectedColor === "red" || selectedColor === "blue"
                    ? selectedColor
                    : "",
              },
            ],
          }));
          setInputValue("");
          setSelectedColor("");
        }}
      >
        <input
          placeholder="your input"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
        <select
          name="idea-colors"
          value={selectedColor}
          onChange={(event) => setSelectedColor(event.target.value)}
        >
          <option value="">--Idea color--</option>
          <option value="red">Red</option>
          <option value="blue">Blue</option>
        </select>
        <button type="submit">Submit idea</button>
      </form>

      {liveState.ideas.map((idea) => (
        <div key={idea.id}>
          {idea.text}
          {idea.color ? ` (${idea.color})` : ""}
          <button
            onClick={() => {
              onChangeLiveState((currentState) => ({
                ...currentState,
                ideas: currentState.ideas.filter((i) => i !== idea),
              }));
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </>
  );
};
