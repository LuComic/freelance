"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ChevronRight, Heart, List, Medal, Trash } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import {
  betaFeedbackIdeasQuery,
  deleteBetaFeedbackIdeaMutation,
  submitBetaFeedbackIdeaMutation,
  toggleBetaFeedbackIdeaVoteMutation,
} from "@/lib/convexFunctionReferences";

type FeedbackIdea = {
  id: Id<"betaFeedbackIdeas">;
  body: string;
  authorUserId: Id<"users">;
  authorName: string;
  voteCount: number;
  hasVoted: boolean;
  isAuthor: boolean;
  createdAt: number;
};

export const IdeaBoradEveryone = () => {
  const ideas = useQuery(betaFeedbackIdeasQuery, {}) as
    | FeedbackIdea[]
    | undefined;
  const submitIdea = useMutation(submitBetaFeedbackIdeaMutation);
  const toggleIdeaVote = useMutation(toggleBetaFeedbackIdeaVoteMutation);
  const deleteIdea = useMutation(deleteBetaFeedbackIdeaMutation);
  const [adding, setAdding] = useState(false);
  const [addingInput, setAddingInput] = useState("");
  const [filter, setFilter] = useState<"all" | "rankings">("all");
  const [submitPending, setSubmitPending] = useState(false);
  const [actingIdeaId, setActingIdeaId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const visibleIdeas = ideas ?? [];
  const rankedIdeas = [...visibleIdeas].sort((firstIdea, secondIdea) => {
    if (secondIdea.voteCount !== firstIdea.voteCount) {
      return secondIdea.voteCount - firstIdea.voteCount;
    }

    return firstIdea.createdAt - secondIdea.createdAt;
  });

  const handleNewIdea = async () => {
    const nextIdea = addingInput.trim();

    if (nextIdea === "") return;

    try {
      setSubmitPending(true);
      setErrorMessage(null);
      await submitIdea({ body: nextIdea });
      setAddingInput("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to submit feedback.",
      );
    } finally {
      setSubmitPending(false);
    }
  };

  const handleDeleteIdea = async (ideaId: Id<"betaFeedbackIdeas">) => {
    try {
      setActingIdeaId(String(ideaId));
      setErrorMessage(null);
      await deleteIdea({ ideaId });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to delete feedback.",
      );
    } finally {
      setActingIdeaId(null);
    }
  };

  const handleLikeOrDislikeIdea = async (ideaId: Id<"betaFeedbackIdeas">) => {
    try {
      setActingIdeaId(String(ideaId));
      setErrorMessage(null);
      await toggleIdeaVote({ ideaId });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update vote.",
      );
    } finally {
      setActingIdeaId(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
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
                if (e.key === "Enter" && !submitPending) {
                  void handleNewIdea();
                }
              }}
            />

            <button
              type="button"
              className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) disabled:cursor-not-allowed"
              onClick={() => void handleNewIdea()}
              disabled={submitPending || addingInput.trim() === ""}
            >
              Add idea
            </button>
          </>
        )}
        {errorMessage ? (
          <p className="text-(--declined-border)">{errorMessage}</p>
        ) : null}
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
          {ideas === undefined ? (
            <div className="p-2 text-(--gray-page)">Loading ideas...</div>
          ) : filter === "rankings" ? (
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
                  className={`w-full ${index !== rankedIdeas.length - 1 ? "border-b" : ""} text-left grid justify-between items-start grid-cols-10 ${index === 0 ? "text-(--first-place)" : index === 1 ? "text-(--second-place)" : index === 2 ? "text-(--third-place)" : ""} border-(--gray) ${index % 2 !== 0 ? "bg-(--gray)/10" : ""} h-11`}
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
                    {idea.voteCount}
                  </span>
                  <span className="text-wrap p-2 border-r border-(--gray) col-span-2 h-full text-left flex items-center justify-start">
                    {idea.authorName}
                  </span>
                  <span className="text-wrap p-2 col-span-6 h-full text-left flex items-center justify-start">
                    {idea.body}
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
              {visibleIdeas.map((idea, index) => {
                const isPending = actingIdeaId === String(idea.id);

                return (
                  <div
                    className={`w-full ${index !== visibleIdeas.length - 1 ? "border-b" : ""} border-(--gray) text-left grid justify-between items-start grid-cols-10 ${index % 2 !== 0 ? "bg-(--gray)/10" : ""} h-11`}
                    key={idea.id}
                  >
                    <div className="flex py-2 border-r border-(--gray) h-full justify-around items-center gap-1 flex-wrap">
                      <button
                        type="button"
                        className="gap-1 flex items-center justify-center p-1.5 rounded-sm h-max aspect-square hover:bg-(--gray)/20 disabled:cursor-not-allowed"
                        onClick={() => void handleLikeOrDislikeIdea(idea.id)}
                        disabled={isPending}
                      >
                        <Heart
                          color={`${idea.hasVoted ? "var(--vibrant)" : "var(--light)"}`}
                          fill={`${idea.hasVoted ? "var(--vibrant)" : "transparent"}`}
                          size={16}
                        />
                      </button>
                      {idea.isAuthor ? (
                        <button
                          type="button"
                          className="gap-1 flex items-center justify-center p-1.5 rounded-sm h-max aspect-square  hover:bg-(--gray)/20 disabled:cursor-not-allowed"
                          onClick={() => void handleDeleteIdea(idea.id)}
                          disabled={isPending}
                        >
                          <Trash size={16} />
                        </button>
                      ) : null}
                    </div>
                    <span
                      className={`p-2 border-r border-(--gray) h-full flex items-center justify-start gap-2 text-wrap text-left capitalize`}
                    >
                      <Heart size={16} />
                      {idea.voteCount}
                    </span>
                    <span className="text-wrap p-2 border-r border-(--gray) col-span-2 h-full text-left flex items-center justify-start">
                      {idea.authorName}
                    </span>
                    <span className="text-wrap p-2 col-span-6 h-full text-left flex items-center justify-start">
                      {idea.body}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      <div className="h-px w-full border-dashed border border-(--gray)"></div>
    </div>
  );
};
