"use client";
import { useState, useRef, useEffect } from "react";
import { ThumbsDown, ThumbsUp, X } from "lucide-react";

export const ReviewModal = ({
  action,
  feature,
  listView,
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
}) => {
  const [review, setReview] = useState(false);
  const [reviewAction, setReviewAction] = useState<"decline" | "accept">();
  const [reviewInput, setReviewInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const closeReview = () => {
    setReview(false);
  };

  const reviewIdea = (action: "decline" | "accept") => {
    setReview(true);
    setReviewAction(action);
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
            className="w-full max-h-1/2 h-auto flex flex-col items-start justify-start gap-2 p-3 @[40rem]:max-w-xl bg-(--darkest) rounded-xl overflow-y-auto border border-(--gray)"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-start gap-4">
              <p className="@[40rem]:text-3xl text-xl font-medium capitalize">
                {action} Client&apos;s idea
              </p>
              <span className="px-2 py-0.5 border rounded-md border-(--gray-page) text-(--gray-page)">
                {feature.tags.join(", ")}
              </span>
            </div>
            <p className="text-(--gray-page)">{feature.feature}</p>
            <p className="@[40rem]:text-xl text-lg font-medium">
              Description for {action === "accept" ? "accepting" : "declining"}
            </p>
            <textarea
              ref={textareaRef}
              placeholder={`I'm ${action === "accept" ? "accepting" : "declining"} this idea because...`}
              className="rounded-md bg-(--dim) w-full px-2 py-1.5 outline-none resize-none overflow-hidden"
              style={{ minHeight: "2.5rem" }}
              value={reviewInput}
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
                className={`gap-1 flex items-center justify-center px-2 py-1 rounded-sm  w-full border ${action === "accept" ? "border-(--accepted-border) hover:bg-(--accepted-bg)/10" : "border-(--declined-border) hover:bg-(--declined-bg)/10"}`}
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
            ? "gap-1 flex items-center justify-center p-1.5 rounded-sm h-max aspect-square  hover:bg-(--gray)/20"
            : "gap-1 flex items-center justify-center px-2 py-1 rounded-sm  w-full border border-(--gray)  hover:bg-(--gray)/20"
        }
        onClick={() => reviewIdea(action)}
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
