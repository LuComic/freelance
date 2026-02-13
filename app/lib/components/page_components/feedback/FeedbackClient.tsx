"use client";

import { useState, useEffect } from "react";
import {
  Hourglass,
  ThumbsDown,
  ThumbsUp,
  TimerReset,
  Trash,
  X,
  ChevronRight,
  Table,
  LayoutGrid,
  Pencil,
} from "lucide-react";
import { setCookie, FEEDBACK_CLIENT_LAYOUT_COOKIE } from "@/app/lib/cookies";

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

type FeedbackClientProps = {
  initialLayout?: "grid" | "list";
};

export const FeedbackClient = ({ initialLayout }: FeedbackClientProps) => {
  const [data, setData] = useState(IDEA_DATA);
  const [ideaInput, setIdeaInput] = useState("");
  const [niceToHave, setNiceToHave] = useState(true);
  const [filter, setFilter] = useState<
    "" | "accepted" | "declined" | "pending" | "dismissed"
  >("");
  const [adding, setAdding] = useState(false);
  const [layout, setLayout] = useState<"grid" | "list">(initialLayout ?? "grid");

  useEffect(() => {
    setCookie(FEEDBACK_CLIENT_LAYOUT_COOKIE, layout);
  }, [layout]);

  const handleNewIdea = () => {
    if (ideaInput === "") return;
    const newItem: itemType = {
      feature: ideaInput,
      status: "pending",
      type: niceToHave ? "nice" : "req",
      dismissed: false,
    };
    setData((prev) => [newItem, ...prev]);
    setIdeaInput("");
  };

  const handleDismissing = (item: itemType) => {
    setData((prev) =>
      prev.map((p) =>
        p.feature === item.feature
          ? { ...p, dismissed: !(p.dismissed && p.dismissed === true) }
          : p,
      ),
    );
  };

  const deleteIdea = (feature: string) => {
    setData((prev) => prev.filter((p) => p.feature !== feature));
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
      ? data.filter((item) => !item.dismissed)
      : data.filter((item) => {
          if (filter === "dismissed") {
            return item.dismissed && item.dismissed === true;
          }
          return item.status === filter && !item.dismissed;
        });

  return (
    <>
      <p className="md:text-xl text-lg font-medium">
        Submit ideas to the creator
      </p>
      <p className="text-(--gray-page)">
        Here you can submit ideas to the creator, who then either accept or
        decline them with a explanaition.
      </p>
      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        <button
          className="md:text-lg text-base font-medium flex items-center justify-start gap-2 cursor-pointer w-max"
          onClick={() => setAdding((prev) => !prev)}
        >
          New idea
          <ChevronRight size={18} className={`${adding && "rotate-90"}`} />
        </button>
        {adding && (
          <>
            <input
              type="text"
              placeholder="I'd like this feature added..."
              className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
              onChange={(e) => setIdeaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNewIdea();
                }
              }}
            />

            <button
              className="flex items-center gap-2 justify-start w-full cursor-pointer"
              onClick={() => setNiceToHave(true)}
            >
              <span className="h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-full bg-(--darkest)">
                {niceToHave && (
                  <span className="bg-(--vibrant) aspect-square h-full rounded-full"></span>
                )}
              </span>
              Nice to have
            </button>
            <button
              className="flex items-center gap-2 justify-start w-full cursor-pointer"
              onClick={() => setNiceToHave(false)}
            >
              <span className="h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-full bg-(--darkest)">
                {!niceToHave && (
                  <span className="bg-(--vibrant) aspect-square h-full rounded-full"></span>
                )}
              </span>
              Required
            </button>

            <button
              className="w-max rounded-md px-2.5 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) cursor-pointer"
              onClick={handleNewIdea}
            >
              Submit
            </button>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 md:flex items-center justify-between md:justify-start w-full gap-2">
        <button
          className="flex items-center justify-center gap-1 w-full md:w-max rounded-md px-2.5 py-1 border text-(--gray-page) border-(--gray-page) cursor-pointer hover:bg-(--gray)/20"
          onClick={() => setLayout(layout === "grid" ? "list" : "grid")}
        >
          {layout === "grid" ? (
            <>
              <LayoutGrid size={16} />
              Grid
            </>
          ) : (
            <>
              <Table size={16} />
              List
            </>
          )}
        </button>

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
          className={`flex items-center justify-center gap-1 w-full md:w-max rounded-md px-2.5 py-1 border ${filter !== "pending" && "text-(--gray-page) border-(--gray-page)"} cursor-pointer hover:bg-(--gray)/20`}
          onClick={() => changeFilter("pending")}
        >
          <Hourglass size={16} />
          Pending
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
      {layout === "grid" ? (
        <div
          className={`w-full flex flex-col md:grid ${visibleData.length === 1 ? "grid-cols-[repeat(auto-fit,minmax(280px,500px))]" : "grid-cols-[repeat(auto-fit,minmax(280px,1fr))]"} gap-2`}
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
                <button
                  className="gap-1 flex items-center justify-center px-2.5 py-1 rounded-sm  w-full border border-(--gray) cursor-pointer hover:bg-(--gray)/20"
                  onClick={() => deleteIdea(feature.feature)}
                >
                  <Trash size={16} />
                  Delete
                </button>
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
      ) : (
        <div className="w-full max-w-full min-w-0 overflow-x-auto">
          <div className="min-w-[800px] flex flex-col">
            <div className="w-full text-(--gray-page) border-b border-(--gray) text-left grid justify-between items-start grid-cols-13 bg-(--darkest)">
              <span className="flex items-center justify-center border-r p-2 border-(--gray) h-full text-wrap">
                <Pencil size={16} />
              </span>
              <span className="border-r p-2 col-span-2 border-(--gray) h-full text-wrap">
                Status
              </span>
              <span className="p-2 col-span-2 border-r border-(--gray) h-full text-wrap">
                Urgency
              </span>
              <span className="p-2 col-span-4 border-r border-(--gray) h-full text-wrap">
                Feature
              </span>
              <span className="text-wrap p-2 col-span-4 h-full">Reason?</span>
            </div>

            {visibleData.map((feature) => (
              <div
                className={`w-full ${visibleData.indexOf(feature) !== visibleData.length - 1 && "border-b"} border-(--gray) text-left grid justify-between items-start grid-cols-13 ${visibleData.indexOf(feature) % 2 !== 0 && "bg-(--gray)/10"}`}
                key={feature.feature}
              >
                <div className="flex py-2 border-r border-(--gray) h-full justify-around">
                  <button
                    className="gap-1 flex items-center justify-center p-1.5 rounded-sm h-max aspect-square cursor-pointer hover:bg-(--gray)/20"
                    onClick={() => deleteIdea(feature.feature)}
                  >
                    <Trash size={16} />
                  </button>
                  <button
                    className="gap-1 flex items-center justify-center p-1.5 rounded-sm h-max aspect-square cursor-pointer hover:bg-(--gray)/20"
                    onClick={() => handleDismissing(feature)}
                  >
                    {feature.dismissed && feature.dismissed === true ? (
                      <>
                        <TimerReset size={16} />
                      </>
                    ) : (
                      <>
                        <X size={16} />
                      </>
                    )}
                  </button>
                </div>
                <span
                  className={`p-2 border-r border-(--gray) h-full text-wrap col-span-2 flex items-start ${feature.status === "accepted" ? "text-(--accepted-border)" : feature.status === "declined" && "text-(--declined-border)"} capitalize`}
                >
                  {feature.status}
                </span>
                <span className="p-2 border-r border-(--gray) h-full text-wrap col-span-2 flex items-start">
                  {feature.type === "nice" ? "Nice to have" : "Required"}
                </span>
                <span className="p-2 col-span-4 border-r border-(--gray) h-full text-wrap flex items-start">
                  {feature.feature}
                </span>
                <span className="text-wrap p-2 px-2 col-span-4 h-full flex items-start">
                  {feature.reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
