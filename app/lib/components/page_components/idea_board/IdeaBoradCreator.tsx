"use client";

import type { Id } from "@/convex/_generated/dataModel";
import type {
  PageComponentInstanceByType,
  PageComponentLiveStateByType,
} from "@/lib/pageDocument";
import { useState } from "react";
import { ChevronRight, Heart, List, Medal, Trash } from "lucide-react";
import {
  createIdea,
  getIdeaAuthorName,
  getIdeaVoteCount,
  hasIdeaVoteFromUser,
  toggleIdeaVote,
} from "./ideaBoardVotes";

type IdeaBoardCreatorProps = {
  authorNames: Record<string, string>;
  currentUserId: Id<"users"> | null;
  liveState: PageComponentLiveStateByType<"IdeaBoard">["state"];
  onChangeLiveState: (
    updater: (
      state: PageComponentLiveStateByType<"IdeaBoard">["state"],
    ) => PageComponentLiveStateByType<"IdeaBoard">["state"],
  ) => void;
  onChangeConfig: (
    updater: (
      config: PageComponentInstanceByType<"IdeaBoard">["config"],
    ) => PageComponentInstanceByType<"IdeaBoard">["config"],
  ) => void;
  config: PageComponentInstanceByType<"IdeaBoard">["config"];
};

export const IdeaBoradCreator = ({
  authorNames,
  currentUserId,
  liveState,
  onChangeLiveState,
  config,
  onChangeConfig,
}: IdeaBoardCreatorProps) => {
  const [adding, setAdding] = useState(false);
  const [addingInput, setAddingInput] = useState("");
  const [filter, setFilter] = useState<"all" | "rankings">("all");
  const [clientEditing, setClientEditing] = useState(false);

  const visibleIdeas = liveState.ideas;
  const rankedIdeas = [...liveState.ideas].sort((firstIdea, secondIdea) => {
    return getIdeaVoteCount(secondIdea) - getIdeaVoteCount(firstIdea);
  });

  const handleNewIdea = () => {
    const nextIdea = addingInput.trim();

    if (nextIdea === "") return;

    onChangeLiveState((currentState) => ({
      ...currentState,
      ideas: [...currentState.ideas, createIdea(nextIdea, currentUserId)],
    }));

    setAddingInput("");
  };

  const handleDeleteIdea = (ideaId: string) => {
    onChangeLiveState((currentState) => ({
      ...currentState,
      ideas: currentState.ideas.filter((idea) => idea.id !== ideaId),
    }));
  };

  const handleLikeOrDislikeIdea = (ideaId: string) => {
    if (currentUserId === null) {
      return;
    }

    onChangeLiveState((currentState) => ({
      ...currentState,
      ideas: currentState.ideas.map((idea) =>
        idea.id === ideaId ? toggleIdeaVote(idea, currentUserId) : idea,
      ),
    }));
  };

  const handleClientAddingPermissions = (index: number) => {
    const canClientAdd = index === 0;

    onChangeConfig((currentConfig) => ({
      ...currentConfig,
      canClientAdd,
    }));
  };

  const handleClientVotingPermissions = (index: number) => {
    const canClientVote = index === 0;

    onChangeConfig((currentConfig) => ({
      ...currentConfig,
      canClientVote,
    }));
  };

  return (
    <>
      <p className="@[40rem]:text-xl text-lg font-medium mt-2">Idea Board</p>
      <p className="text-(--gray-page)">
        Here you can add and vote on ideas submitted by all project members
        (unless the client is denied). Only creators can remove ideas
      </p>
      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        <button
          type="button"
          className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2  w-max"
          onClick={() => setAdding((prev) => !prev)}
        >
          Add Idea
          <ChevronRight size={18} className={adding ? "rotate-90" : ""} />
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
              type="button"
              className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
              onClick={handleNewIdea}
            >
              Add idea
            </button>
          </>
        )}

        <div className="w-full h-px bg-(--gray)" />

        <button
          type="button"
          className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2 w-max"
          onClick={() => setClientEditing((prev) => !prev)}
        >
          Client permissions
          <ChevronRight
            size={18}
            className={`${clientEditing && "rotate-90"}`}
          />
        </button>
        {clientEditing && (
          <>
            <p className="text-(--gray-page)">
              Removing client&apos;s permissions when they have already voted or
              sumbitted an idea, will remove their votes/ideas.
            </p>
            <div className="flex flex-col gap-1">
              <p className="font-medium text-(--gray-page)">
                Can a client add their own ideas?
              </p>
              {["Yes, client can add", "No, client cannot add ideas"].map(
                (option, index) => (
                  <button
                    type="button"
                    key={option}
                    className="flex items-center gap-2 justify-start w-full "
                    onClick={() => handleClientAddingPermissions(index)}
                  >
                    <span className="h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-full bg-(--darkest)">
                      {((config.canClientAdd && index === 0) ||
                        (!config.canClientAdd && index === 1)) && (
                        <span className="bg-(--vibrant) aspect-square h-full rounded-full" />
                      )}
                    </span>
                    {option}
                  </button>
                ),
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-medium text-(--gray-page)">
                Can a client vote on ideas?
              </p>
              {["Yes, client can vote", "No, client cannot vote"].map(
                (option, index) => (
                  <button
                    type="button"
                    key={option}
                    className="flex items-center gap-2 justify-start w-full "
                    onClick={() => handleClientVotingPermissions(index)}
                  >
                    <span className="h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-full bg-(--darkest)">
                      {((config.canClientVote && index === 0) ||
                        (!config.canClientVote && index === 1)) && (
                        <span className="bg-(--vibrant) aspect-square h-full rounded-full" />
                      )}
                    </span>
                    {option}
                  </button>
                ),
              )}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 @[40rem]:flex items-center justify-between @[40rem]:justify-start w-full gap-2">
        <button
          type="button"
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "all" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
          onClick={() => setFilter("all")}
        >
          <List size={16} />
          All
        </button>
        <button
          type="button"
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "rankings" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
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
                  <span
                    className={`p-2 border-r border-(--gray) h-full flex items-center justify-start gap-2 text-wrap capitalize`}
                  >
                    {index + 1}.
                  </span>
                  <span
                    className={`p-2 border-r border-(--gray) h-full flex items-center justify-start gap-2 text-wrap capitalize`}
                  >
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
                  <div className="flex py-2 border-r border-(--gray) h-full justify-around items-center gap-1 flex-wrap">
                    {(() => {
                      const hasVoted = hasIdeaVoteFromUser(idea, currentUserId);

                      return (
                        <button
                          type="button"
                          className="gap-1 flex items-center justify-center p-1.5 rounded-sm h-max aspect-square hover:bg-(--gray)/20 disabled:cursor-not-allowed"
                          onClick={() => handleLikeOrDislikeIdea(idea.id)}
                          disabled={currentUserId === null}
                        >
                          <Heart
                            color={`${hasVoted ? "var(--vibrant)" : "var(--light)"}`}
                            fill={`${hasVoted ? "var(--vibrant)" : "transparent"}`}
                            size={16}
                          />
                        </button>
                      );
                    })()}
                    <button
                      type="button"
                      className="gap-1 flex items-center justify-center p-1.5 rounded-sm h-max aspect-square  hover:bg-(--gray)/20"
                      onClick={() => handleDeleteIdea(idea.id)}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                  <span
                    className={`p-2 border-r border-(--gray) h-full flex items-center justify-start gap-2 text-wrap text-left capitalize`}
                  >
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
