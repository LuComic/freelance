"use client";

import type { Id } from "@/convex/_generated/dataModel";
import type {
  PageComponentInstanceByType,
  PageComponentLiveStateByType,
} from "@/lib/pageDocument";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { createIdea } from "./ideaBoardVotes";

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
  const [clientEditing, setClientEditing] = useState(false);

  const handleNewIdea = () => {
    const nextIdea = addingInput.trim();

    if (nextIdea === "") return;

    onChangeLiveState((currentState) => ({
      ...currentState,
      ideas: [...currentState.ideas, createIdea(nextIdea, currentUserId)],
    }));

    setAddingInput("");
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
              className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
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
    </>
  );
};
