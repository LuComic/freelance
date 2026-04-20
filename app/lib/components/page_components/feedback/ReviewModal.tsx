"use client";

import { useState, useRef, useEffect } from "react";
import { ThumbsDown, ThumbsUp, X } from "lucide-react";
import { MAX_DESCRIPTION_LENGTH } from "@/lib/inputLimits";

export const ReviewModal = ({
  action,
  feature,
  listView,
  onSubmit,
}: {
  action: "accept" | "decline";
  feature: {
    feature: string;
    status: "pending" | "accepted" | "declined";
    tags: string[];
    reason?: string;
    dismissed?: boolean;
  };
  listView?: boolean;
  onSubmit: (reason: string) => void | Promise<void>;
}) => {
  const [review, setReview] = useState(false);
  const [reviewInput, setReviewInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const closeReview = () => {
    setReview(false);
  };

  const reviewIdea = () => {
    setReview(true);
  };

  useEffect(() => {
    if (!review) {
      document.body.style.overflow = "auto";
      return;
    }

    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeReview();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [review]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (review && textareaRef.current) {
      adjustTextareaHeight();
    }
  }, [review]);

  return (
    <>
      {review && (
        <div
          className="fixed px-2 inset-0 z-30 flex items-center justify-center bg-black/60"
          onClick={() => {
            closeReview();
            setReviewInput("");
          }}
        >
          <div
            className="w-full max-h-1/2 h-auto flex flex-col items-start justify-start gap-2 p-3 md:max-w-xl bg-(--darkest) rounded-xl overflow-y-auto border border-(--gray)"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-start gap-4">
              <p className="md:text-3xl text-xl font-medium capitalize">
                {action} Client&apos;s idea
              </p>
              {feature.tags.length > 0 && (
                <span className="px-2 py-0.5 border rounded-md border-(--gray-page) text-(--gray-page)">
                  {feature.tags.join(", ")}
                </span>
              )}
            </div>
            <p className="text-(--gray-page)">{feature.feature}</p>
            <p className="md:text-xl text-lg font-medium">
              Description for {action === "accept" ? "accepting" : "declining"}
            </p>
            <textarea
              ref={textareaRef}
              placeholder={`I'm ${action === "accept" ? "accepting" : "declining"} this idea because...`}
              className="rounded-md bg-(--dim) w-full px-2 py-1.5 outline-none resize-none overflow-hidden"
              style={{ minHeight: "2.5rem" }}
              value={reviewInput}
              maxLength={MAX_DESCRIPTION_LENGTH}
              onChange={(e) => {
                setReviewInput(e.target.value);
                adjustTextareaHeight();
              }}
            ></textarea>
            <div className="w-full flex items-center gap-1 mt-4">
              <button
                className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm  w-full border border-(--gray)  hover:bg-(--gray)/20"
                onClick={closeReview}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                className={`gap-1 flex items-center justify-center px-2 py-1 rounded-sm  w-full border ${action === "accept" ? "border-(--accepted-border) bg-(--accepted-bg)/10 hover:bg-(--accepted-bg)/20" : "border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20"}`}
                onClick={() => {
                  onSubmit(reviewInput);
                  closeReview();
                  setReviewInput("");
                }}
              >
                {action === "accept" ? (
                  <>
                    <ThumbsUp size={16} />
                    Accept
                  </>
                ) : (
                  <>
                    <ThumbsDown size={16} />
                    Decline
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        className={
          listView
            ? "gap-1 flex items-center justify-center p-1.5 rounded-sm h-max aspect-square hover:bg-(--gray)/20"
            : "gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--gray) hover:bg-(--gray)/20"
        }
        onClick={reviewIdea}
      >
        {action === "accept" ? (
          <>
            <ThumbsUp size={16} />
            {!listView && "Accept"}
          </>
        ) : (
          <>
            <ThumbsDown size={16} />
            {!listView && "Decline"}
          </>
        )}
      </button>
    </>
  );
};
