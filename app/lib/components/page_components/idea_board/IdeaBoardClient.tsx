"use client";

import { useState } from "react";
import type {
  PageComponentInstanceByType,
  PageComponentLiveStateByType,
} from "@/lib/pageDocument";
import { ChevronRight, Heart, List, Medal } from "lucide-react";

type IdeaBoardClientProps = {
  config: PageComponentInstanceByType<"IdeaBoard">["config"];
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

export const IdeaBoardClient = ({
  config,
  liveState,
  onChangeLiveState,
}: IdeaBoardClientProps) => {
  const [adding, setAdding] = useState(false);
  const [addingInput, setAddingInput] = useState("");
  const [filter, setFilter] = useState<"all" | "rankings">("all");

  const visibleIdeas =
    filter === "rankings"
      ? [...liveState.ideas].sort((firstIdea, secondIdea) => {
          return secondIdea.votes - firstIdea.votes;
        })
      : liveState.ideas;

  const handleNewIdea = () => {
    const nextIdea = addingInput.trim();

    if (!config.canClientAdd || nextIdea === "") {
      return;
    }

    onChangeLiveState((currentState) => ({
      ...currentState,
      ideas: [
        ...currentState.ideas,
        {
          id: createIdeaId(),
          idea: nextIdea,
          votes: 0,
        },
      ],
    }));

    setAddingInput("");
  };

  const handleVote = (ideaId: string) => {
    if (!config.canClientVote) {
      return;
    }

    onChangeLiveState((currentState) => ({
      ...currentState,
      ideas: currentState.ideas.map((idea) =>
        idea.id === ideaId ? { ...idea, votes: idea.votes + 1 } : idea,
      ),
    }));
  };

  return (
    <>
      <p className="@[40rem]:text-xl text-lg font-medium">Idea Board</p>
      <p className="text-(--gray-page)">
        Share ideas with the team and vote on the ones worth pursuing.
      </p>

      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        <button
          type="button"
          className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2 w-max disabled:text-(--gray-page)"
          onClick={() => setAdding((prev) => !prev)}
          disabled={!config.canClientAdd}
        >
          Add Idea
          <ChevronRight size={18} className={adding ? "rotate-90" : ""} />
        </button>
        {config.canClientAdd ? (
          adding && (
            <>
              <input
                type="text"
                placeholder="Share a new idea..."
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
                type="button"
                className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
                onClick={handleNewIdea}
              >
                Add idea
              </button>
            </>
          )
        ) : (
          <p className="text-(--gray-page)">
            Idea submission is currently limited to creators.
          </p>
        )}

        {!config.canClientVote && (
          <p className="text-(--gray-page)">
            Voting is currently limited to creators.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 @[40rem]:flex items-center justify-between @[40rem]:justify-start w-full gap-2">
        <button
          type="button"
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "all" ? "text-(--gray-page) border-(--gray-page)" : ""} hover:bg-(--gray)/20`}
          onClick={() => setFilter("all")}
        >
          <List size={16} />
          All
        </button>
        <button
          type="button"
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "rankings" ? "text-(--gray-page) border-(--gray-page)" : ""} hover:bg-(--gray)/20`}
          onClick={() => setFilter("rankings")}
        >
          <Medal size={16} />
          Rankings
        </button>
      </div>

      <div className="w-full max-w-full min-w-0 overflow-x-auto border rounded-md border-(--gray)">
        <div className="min-w-[900px] flex flex-col">
          <div
            className={`w-full text-(--gray-page) ${visibleIdeas.length > 0 ? "border-b" : ""} border-(--gray) text-left grid justify-between items-start grid-cols-8 bg-(--darkest)`}
          >
            <span className="border-r p-2 border-(--gray) h-full text-wrap">
              Actions
            </span>
            <span className="p-2 border-r border-(--gray) h-full text-wrap">
              Votes
            </span>
            <span className="p-2 col-span-6 border-(--gray) h-full text-wrap">
              Idea
            </span>
          </div>
          {visibleIdeas.map((idea, index) => (
            <div
              className={`w-full ${index !== visibleIdeas.length - 1 ? "border-b" : ""} border-(--gray) text-left grid justify-between items-start grid-cols-8 ${index % 2 !== 0 ? "bg-(--gray)/10" : ""}`}
              key={idea.id}
            >
              <div className="flex py-2 border-r border-(--gray) h-full justify-around items-center gap-1 flex-wrap">
                <button
                  type="button"
                  className="gap-1 flex items-center justify-center h-max px-1.5 py-0.5 rounded-sm disabled:cursor-not-allowed hover:bg-(--gray)/20"
                  onClick={() => handleVote(idea.id)}
                  disabled={!config.canClientVote}
                >
                  <Heart size={16} />
                  Vote
                </button>
              </div>
              <span className="p-2 border-r border-(--gray) h-full flex items-center justify-start gap-2 text-wrap text-left capitalize">
                <Heart size={16} />
                {idea.votes}
              </span>
              <span className="text-wrap p-2 col-span-6 h-full text-left">
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
