"use client";

import { ChevronRight, Heart, List, Medal } from "lucide-react";
import { useState } from "react";

type IdeaFilter = "all" | "rankings";

const IDEAS = [
  {
    id: "idea_1",
    idea: "Add a client onboarding checklist",
    author: "Dale Cooper",
    votes: 3,
  },
  {
    id: "idea_2",
    idea: "Create reusable proposal templates",
    author: "Client",
    votes: 1,
  },
  {
    id: "idea_3",
    idea: "Show weekly project summaries",
    author: "Designer",
    votes: 2,
  },
  {
    id: "idea_4",
    idea: "Let clients mark priorities",
    author: "Anonymous",
    votes: 0,
  },
];

export const IdeaBoardPreview = () => {
  const [filter, setFilter] = useState<IdeaFilter>("all");
  const [adding, setAdding] = useState(false);
  const [ideaInput, setIdeaInput] = useState("");

  const visibleIdeas =
    filter === "rankings"
      ? [...IDEAS].sort(
          (firstIdea, secondIdea) => secondIdea.votes - firstIdea.votes,
        )
      : IDEAS;

  const submitIdea = () => {
    setIdeaInput("");
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        <button
          type="button"
          className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2 w-max disabled:text-(--gray-page)"
          onClick={() => setAdding((current) => !current)}
        >
          Add Idea
          <ChevronRight size={18} className={adding ? "rotate-90" : ""} />
        </button>

        {adding ? (
          <>
            <input
              type="text"
              placeholder="Share a new idea..."
              className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
              value={ideaInput}
              onChange={(event) => setIdeaInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submitIdea();
                }
              }}
            />
            <button
              type="button"
              className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
              onClick={submitIdea}
            >
              Add idea
            </button>
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-2 @[40rem]:flex items-center justify-between @[40rem]:justify-start w-full gap-2">
        <button
          type="button"
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "all" ? "text-(--gray-page) border-(--gray-page) hover:bg-(--gray)/20" : "bg-(--light)/10 hover:bg-(--light)/15"}`}
          onClick={() => setFilter("all")}
        >
          <List size={16} className="shrink-0" />
          All
        </button>
        <button
          type="button"
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "rankings" ? "text-(--gray-page) border-(--gray-page) hover:bg-(--gray)/20" : "bg-(--light)/10 hover:bg-(--light)/15"}`}
          onClick={() => setFilter("rankings")}
        >
          <Medal size={16} className="shrink-0" />
          Rankings
        </button>
      </div>

      <div className="w-full max-w-full min-w-0 overflow-x-auto border rounded-md border-(--gray)">
        <div className="min-w-225 flex flex-col">
          <div className="w-full text-(--gray-page) border-b border-(--gray) text-left grid justify-between items-start grid-cols-10 bg-(--darkest) h-11">
            <span className="border-r p-2 border-(--gray) h-full text-wrap flex items-center justify-start">
              {filter === "rankings" ? "Rank" : "Actions"}
            </span>
            <span className="p-2 border-r border-(--gray) h-full text-wrap flex items-center justify-start">
              Votes
            </span>
            <span className="p-2 border-r border-(--gray) col-span-2 h-full text-wrap flex items-center justify-start">
              Author
            </span>
            <span className="p-2 col-span-6 border-(--gray) h-full text-wrap flex items-center justify-start">
              Idea
            </span>
          </div>

          {visibleIdeas.map((idea, index) => (
            <div
              className={`w-full ${index !== visibleIdeas.length - 1 ? "border-b" : ""} border-(--gray) text-left grid justify-between items-start grid-cols-10 ${
                filter === "rankings"
                  ? index === 0
                    ? "text-(--first-place)"
                    : index === 1
                      ? "text-(--second-place)"
                      : index === 2
                        ? "text-(--third-place)"
                        : ""
                  : ""
              } ${index % 2 !== 0 ? "bg-(--gray)/10" : ""}`}
              key={idea.id}
            >
              <div className="flex p-2 border-r border-(--gray) h-full justify-start items-center gap-1 flex-wrap">
                {filter === "rankings" ? (
                  `${index + 1}.`
                ) : (
                  <button
                    type="button"
                    className="gap-1 flex items-center justify-center h-max px-1.5 py-0.5 rounded-sm disabled:cursor-not-allowed hover:bg-(--gray)/20"
                  >
                    <Heart size={16} />
                    Vote
                  </button>
                )}
              </div>
              <span className="p-2 border-r border-(--gray) h-full flex items-center justify-start gap-2 text-wrap text-left capitalize">
                <Heart size={16} />
                {idea.votes}
              </span>
              <span className="text-wrap p-2 border-r border-(--gray) col-span-2 h-full text-left flex items-center justify-start">
                {idea.author}
              </span>
              <span className="text-wrap p-2 col-span-6 h-full text-left flex items-center justify-start">
                {idea.idea}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
