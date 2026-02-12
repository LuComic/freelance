"use client";
import { useState, useRef, useEffect } from "react";
import { ThumbsDown, ThumbsUp, X } from "lucide-react";

export const ReviewModal = ({
  action,
  feature,
}: {
  action: "accept" | "decline";
  feature: {
    feature: string;
    status: "pending" | "accepted" | "declined";
    type: "nice" | "req";
    reason?: string;
    dismissed?: boolean;
  };
}) => {
  const [review, setReview] = useState(false);
  const [reviewAction, setReviewAction] = useState<"decline" | "accept">();
  const [reviewInput, setReviewInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const closeReview = () => {
    setReview(false);
    document.body.style.overflow = "auto";
  };

  const reviewIdea = (action: "decline" | "accept") => {
    setReview(true);
    setReviewAction(action);
    document.body.style.overflow = "hidden";
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeReview();
      }
    };
    if (review) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }
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
                {action} Client's idea
              </p>
              <span className="px-2 py-0.5 border rounded-md border-(--gray-page) text-(--gray-page)">
                {feature.type === "nice" ? "Nice to have" : "Required"}
              </span>
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
              onChange={(e) => {
                setReviewInput(e.target.value);
                adjustTextareaHeight();
              }}
            ></textarea>
            <div className="w-full flex items-center gap-1 mt-4">
              <button
                className="gap-1 flex items-center justify-center px-2.5 py-1 rounded-sm  w-full border border-(--gray) cursor-pointer hover:bg-(--gray)/20"
                onClick={closeReview}
              >
                <X size={16} />
                Cancel
              </button>
              <button className="gap-1 flex items-center justify-center px-2.5 py-1 rounded-sm  w-full border border-(--vibrant) cursor-pointer hover:bg-(--vibrant)">
                <ThumbsUp size={16} />
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        className="gap-1 flex items-center justify-center px-2.5 py-1 rounded-sm  w-full border border-(--gray) cursor-pointer hover:bg-(--gray)/20"
        onClick={() => reviewIdea(action)}
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
    </>
  );
};
