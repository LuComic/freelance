"use client";

import type { Id } from "@/convex/_generated/dataModel";
import type {
  PageComponentInstanceByType,
  PageComponentLiveStateByType,
} from "@/lib/pageDocument";
import { useState } from "react";
import { ChevronRight, Heart, List, Medal } from "lucide-react";
import {
  createIdea,
  getIdeaAuthorName,
  getIdeaVoteCount,
  hasIdeaVoteFromUser,
  toggleIdeaVote,
} from "./ideaBoardVotes";

type IdeaBoardClientProps = {
  authorNames: Record<string, string>;
  config: PageComponentInstanceByType<"IdeaBoard">["config"];
  currentUserId: Id<"users"> | null;
  liveState: PageComponentLiveStateByType<"IdeaBoard">["state"];
  onChangeLiveState: (
    updater: (
      state: PageComponentLiveStateByType<"IdeaBoard">["state"],
    ) => PageComponentLiveStateByType<"IdeaBoard">["state"],
  ) => void;
};

export const IdeaBoardClient = ({
  authorNames,
  config,
  currentUserId,
  liveState,
  onChangeLiveState,
}: IdeaBoardClientProps) => {
  const [adding, setAdding] = useState(false);
  const [addingInput, setAddingInput] = useState("");
  const [filter, setFilter] = useState<"all" | "rankings">("all");

  const visibleIdeas = liveState.ideas;
  const rankedIdeas = [...liveState.ideas].sort((firstIdea, secondIdea) => {
    return getIdeaVoteCount(secondIdea) - getIdeaVoteCount(firstIdea);
  });

  const handleNewIdea = () => {
    const nextIdea = addingInput.trim();

    if (!config.canClientAdd || nextIdea === "") {
      return;
    }

    onChangeLiveState((currentState) => ({
      ...currentState,
      ideas: [...currentState.ideas, createIdea(nextIdea, currentUserId)],
    }));

    setAddingInput("");
  };

  const handleVote = (ideaId: string) => {
    if (!config.canClientVote || currentUserId === null) {
      return;
    }

    onChangeLiveState((currentState) => ({
      ...currentState,
      ideas: currentState.ideas.map((idea) =>
        idea.id === ideaId ? toggleIdeaVote(idea, currentUserId) : idea,
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
        <div className="min-w-225 flex flex-col">
          {filter === "rankings" ? (
            <>
              <div
                className={`w-full text-(--gray-page) ${rankedIdeas.length > 0 ? "border-b" : ""} border-(--gray) text-left grid justify-between items-start grid-cols-10 bg-(--darkest) h-11`}
              >
                <span className="border-r p-2 border-(--gray) h-full text-wrap flex items-center justify-start">
                  Rank
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
              {rankedIdeas.map((idea, index) => (
                <div
                  className={`w-full ${index !== rankedIdeas.length - 1 ? "border-b" : ""} text-left grid justify-between items-start grid-cols-10 ${index === 0 ? "text-(--first-place)" : index === 1 ? "text-(--second-place)" : index === 2 ? "text-(--third-place)" : ""} border-(--gray) ${index % 2 !== 0 ? "bg-(--gray)/10" : ""}`}
                  key={idea.id}
                >
                  <span className="p-2 border-r border-(--gray) h-full flex items-center justify-start gap-2 text-wrap">
                    {index + 1}.
                  </span>
                  <span className="p-2 border-r border-(--gray) h-full flex items-center justify-start gap-2 text-wrap">
                    <Heart size={16} />
                    {getIdeaVoteCount(idea)}
                  </span>
                  <span className="text-wrap p-2 border-r border-(--gray) col-span-2 h-full text-left flex items-center justify-start">
                    {getIdeaAuthorName(idea, authorNames)}
                  </span>
                  <span className="text-wrap p-2 col-span-6 h-full text-left flex items-center justify-start">
                    {idea.idea}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <>
              <div
                className={`w-full text-(--gray-page) ${visibleIdeas.length > 0 ? "border-b" : ""} border-(--gray) text-left grid justify-between items-start grid-cols-10 bg-(--darkest) h-11`}
              >
                <span className="border-r p-2 border-(--gray) h-full text-wrap flex items-center justify-start">
                  Actions
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
                  className={`w-full ${index !== visibleIdeas.length - 1 ? "border-b" : ""} border-(--gray) text-left grid justify-between items-start grid-cols-10 ${index % 2 !== 0 ? "bg-(--gray)/10" : ""}`}
                  key={idea.id}
                >
                  <div className="flex p-2 border-r border-(--gray) h-full justify-start items-center gap-1 flex-wrap">
                    {(() => {
                      const hasVoted = hasIdeaVoteFromUser(idea, currentUserId);

                      return (
                        <button
                          type="button"
                          className="gap-1 flex items-center justify-center h-max px-1.5 py-0.5 rounded-sm disabled:cursor-not-allowed hover:bg-(--gray)/20"
                          onClick={() => handleVote(idea.id)}
                          disabled={
                            !config.canClientVote || currentUserId === null
                          }
                        >
                          <Heart
                            size={16}
                            color={`${hasVoted ? "var(--vibrant)" : "var(--light)"}`}
                            fill={`${hasVoted ? "var(--vibrant)" : "transparent"}`}
                          />
                          {hasVoted ? "Voted" : "Vote"}
                        </button>
                      );
                    })()}
                  </div>
                  <span className="p-2 border-r border-(--gray) h-full flex items-center justify-start gap-2 text-wrap text-left capitalize">
                    <Heart size={16} />
                    {getIdeaVoteCount(idea)}
                  </span>
                  <span className="text-wrap p-2 border-r border-(--gray) col-span-2 h-full text-left flex items-center justify-start">
                    {getIdeaAuthorName(idea, authorNames)}
                  </span>
                  <span className="text-wrap p-2 col-span-6 h-full text-left flex items-center justify-start">
                    {idea.idea}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="h-px w-full border-dashed border border-(--gray)"></div>
    </>
  );
};
