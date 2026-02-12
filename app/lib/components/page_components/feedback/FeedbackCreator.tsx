"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp, TimerReset, X } from "lucide-react";
import { ReviewModal } from "./ReviewModal";

type itemType = {
  feature: string;
  status: "pending" | "accepted" | "declined";
  type: "nice" | "req";
  reason?: string;
  dismissed?: boolean;
};

let IDEA_DATA: itemType[] = [
  {
    feature: "Please add an About page",
    status: "accepted",
    type: "req",
    reason:
      "Yeah sure, added it right now. Let me know if you want any changes there",
  },
  {
    feature: "Turn the selector in X page into a slider",
    type: "nice",
    status: "pending",
  },
  {
    feature:
      "Create a 3D animation on the landing page that is 4k resolution and has no mistakes",
    status: "declined",
    type: "nice",
    reason: "You're not paying enough for that",
  },
];

export const FeedbackCreator = () => {
  const [data, setData] = useState(IDEA_DATA);
  const [filter, setFilter] = useState<
    "" | "accepted" | "declined" | "pending" | "dismissed"
  >("");

  const handleDismissing = (item: itemType) => {
    setData((prev) =>
      prev.map((p) =>
        p.feature === item.feature
          ? { ...p, dismissed: !(p.dismissed && p.dismissed === true) }
          : p,
      ),
    );
  };

  const changeFilter = (
    newFilter: "accepted" | "declined" | "pending" | "dismissed",
  ) => {
    if (filter === newFilter) {
      setFilter("");
      return;
    }

    setFilter(newFilter);
  };

  const visibleData =
    filter === ""
      ? data.filter((item) => !item.dismissed && item.status === "pending")
      : data.filter((item) => {
          if (filter === "dismissed") {
            return item.dismissed && item.dismissed === true;
          }
          return item.status === filter && !item.dismissed;
        });

  return (
    <>
      <p className="md:text-xl text-lg font-medium">Client's ideas</p>
      <p className="text-(--gray-page)">
        Here you can accept or decline the ideas proposed by the client and give
        an explanation to your decision.
      </p>
      <div className="grid grid-cols-2 md:flex items-center justify-between md:justify-start w-full gap-2">
        <button
          className={`flex items-center justify-center gap-1 w-full md:w-max rounded-md px-2.5 py-1 border ${filter !== "accepted" && "text-(--gray-page) border-(--gray-page)"} cursor-pointer hover:bg-(--gray)/20`}
          onClick={() => changeFilter("accepted")}
        >
          <ThumbsUp size={16} />
          Accepted
        </button>
        <button
          className={`flex items-center justify-center gap-1 w-full md:w-max rounded-md px-2.5 py-1 border ${filter !== "declined" && "text-(--gray-page) border-(--gray-page)"} cursor-pointer hover:bg-(--gray)/20`}
          onClick={() => changeFilter("declined")}
        >
          <ThumbsDown size={16} />
          Declined
        </button>
        <button
          className={`flex items-center justify-center gap-1 w-full md:w-max rounded-md px-2.5 py-1 border ${filter !== "dismissed" && "text-(--gray-page) border-(--gray-page)"} cursor-pointer hover:bg-(--gray)/20`}
          onClick={() => changeFilter("dismissed")}
        >
          <X size={16} />
          Dismissed (
          {
            data.filter((item) => item.dismissed && item.dismissed === true)
              .length
          }
          )
        </button>
      </div>
      <div
        className={`w-full flex flex-col md:grid ${visibleData.length === 1 ? "grid-cols-[repeat(auto-fit,minmax(280px,500px))]" : "grid-cols-[repeat(auto-fit,minmax(280px,1fr))]"}  gap-2`}
      >
        {visibleData.map((feature) => (
          <div
            key={feature.feature}
            className={`rounded-md border px-2 gap-1 justify-between py-1.5 w-full min-w-0 flex flex-col min-h-0 ${
              feature.status === "pending"
                ? "border-(--gray) bg-(--gray)/10"
                : feature.status === "accepted"
                  ? "border-(--accepted-border) bg-(--accepted-bg)/10"
                  : feature.status === "declined" &&
                    "border-(--declined-border) bg-(--declined-bg)/10"
            }
                   `}
          >
            <span className="font-semibold">
              <span className="rounded-sm font-normal text-(--gray-page)">
                {feature.type === "nice" ? "Nice" : "Required"} -{" "}
              </span>
              {feature.feature}
            </span>
            {feature.status === "pending" && (
              <span className="font-medium">Pending...</span>
            )}
            {feature.reason && (
              <span className="font-medium">
                {feature.status === "accepted" ? "Accepted: " : "Declined: "}{" "}
                <span className="font-normal">{feature.reason}</span>
              </span>
            )}
            <div className="w-full flex items-center gap-1">
              {feature.status !== "pending" ? (
                <ReviewModal
                  action={feature.status === "accepted" ? "decline" : "accept"}
                  feature={feature}
                />
              ) : (
                <>
                  <ReviewModal action="accept" feature={feature} />
                  <ReviewModal action="decline" feature={feature} />
                </>
              )}
              <button
                className="gap-1 flex items-center justify-center px-2.5 py-1 rounded-sm  w-full border border-(--gray) cursor-pointer hover:bg-(--gray)/20"
                onClick={() => handleDismissing(feature)}
              >
                {feature.dismissed && feature.dismissed === true ? (
                  <>
                    <TimerReset size={16} />
                    Restore
                  </>
                ) : (
                  <>
                    <X size={16} />
                    Dismiss
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
