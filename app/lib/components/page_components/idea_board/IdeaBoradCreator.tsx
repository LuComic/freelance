"use client";

import { useState } from "react";
import type { PageComponentLiveStateByType } from "@/lib/pageDocument";
import { ChevronRight, Heart, List, Medal, Trash } from "lucide-react";

type IdeaBoardCreatorProps = {
  liveState: PageComponentLiveStateByType<"IdeaBoard">["state"];
  onChangeLiveState: (
    updater: (
      state: PageComponentLiveStateByType<"IdeaBoard">["state"],
    ) => PageComponentLiveStateByType<"IdeaBoard">["state"],
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

export const IdeaBoradCreator = ({
  liveState,
  onChangeLiveState,
}: IdeaBoardCreatorProps) => {
  const [adding, setAdding] = useState(false);
  const [addingInput, setAddingInput] = useState("");
  const [filter, setFilter] = useState("all");

  const handleNewIdea = () => {};

  return (
    <>
      <p className="@[40rem]:text-xl text-lg font-medium">Idea Board</p>
      <p className="text-(--gray-page)">
        Here you can add and vote on ideas submitted by all project members
        (unless the client is denied). Only creators can remove ideas
      </p>
      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        <button
          className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2  w-max"
          onClick={() => setAdding((prev) => !prev)}
        >
          Add Idea
          <ChevronRight size={18} className={`${adding && "rotate-90"}`} />
        </button>
        {adding && (
          <>
            <input
              type="text"
              placeholder="Add a new tag..."
              className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
              value={addingInput}
              onChange={(e) => setAddingInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNewIdea();
                }
              }}
            />

            <button
              className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) "
              onClick={handleNewIdea}
            >
              Add idea
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 @[40rem]:flex items-center justify-between @[40rem]:justify-start w-full gap-2">
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "all" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
          onClick={() => setFilter("all")}
        >
          <List size={16} />
          All
        </button>
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "rankings" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
          onClick={() => setFilter("rankings")}
        >
          <Medal size={16} />
          Rankings
        </button>
      </div>

      <div className="w-full max-w-full min-w-0 overflow-x-auto border rounded-md border-(--gray)">
        <div className="min-w-[900px] flex flex-col">
          <div
            className={`w-full text-(--gray-page) ${liveState.ideas.length > 0 && "border-b"} border-(--gray) text-left grid justify-between items-start grid-cols-6 bg-(--darkest)`}
          >
            <span className="border-r p-2 border-(--gray) h-full text-wrap">
              Actions
            </span>
            <span className="p-2 border-r border-(--gray) h-full text-wrap">
              Votes
            </span>
            <span className="p-2 col-span-4 border-(--gray) h-full text-wrap">
              Idea
            </span>
          </div>
          {liveState.ideas.map((idea, index) => (
            <div
              className={`w-full ${index !== liveState.ideas.length - 1 && "border-b"} border-(--gray) text-left grid justify-between items-start grid-cols-6 ${index % 2 !== 0 && "bg-(--gray)/10"}`}
              key={idea.id}
            >
              <div className="flex py-2 border-r border-(--gray) h-full justify-around items-center gap-1 flex-wrap">
                <button className="gap-1 flex items-center justify-center p-1.5 rounded-sm h-max aspect-square  hover:bg-(--gray)/20">
                  <Heart size={16} />
                  Vote
                </button>
                <button className="gap-1 flex items-center justify-center p-1.5 rounded-sm h-max aspect-square  hover:bg-(--gray)/20">
                  <Trash size={16} />
                  Remove
                </button>
              </div>
              <span
                className={`p-2 border-r border-(--gray) h-full flex items-center justify-start gap-2 text-wrap text-left capitalize`}
              >
                <Heart size={16} />
                {idea.votes}
              </span>
              <span className="text-wrap p-2 col-span-4 h-full text-left">
                {idea.idea}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px w-full border-dashed border border-(--gray)"></div>
    </>
  );
};
