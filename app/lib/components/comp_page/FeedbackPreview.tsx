"use client";

import {
  ChevronRight,
  Hourglass,
  LayoutGrid,
  Pencil,
  Table,
  ThumbsDown,
  ThumbsUp,
  TimerReset,
  Trash,
  X,
} from "lucide-react";
import { useState } from "react";

type FeedbackFilter = "" | "accepted" | "declined" | "pending" | "dismissed";
type FeedbackLayout = "grid" | "list";

const TAGS = ["Design", "Content"];

const FEEDBACK_ITEMS = [
  {
    feature: "Add a dark mode toggle",
    status: "pending",
    tags: ["Design"],
    reason: "",
    dismissed: false,
  },
  {
    feature: "Add invoice export",
    status: "accepted",
    tags: ["Content"],
    reason: "This fits the next release.",
    dismissed: false,
  },
];

export const FeedbackPreview = () => {
  const [layout, setLayout] = useState<FeedbackLayout>("grid");
  const [filter, setFilter] = useState<FeedbackFilter>("");
  const [adding, setAdding] = useState(false);
  const [ideaInput, setIdeaInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleFilter = (nextFilter: FeedbackFilter) => {
    setFilter((currentFilter) =>
      currentFilter === nextFilter ? "" : nextFilter,
    );
  };

  const visibleItems = FEEDBACK_ITEMS.filter((item) => {
    if (filter === "") return !item.dismissed;
    if (filter === "dismissed") return item.dismissed;
    return item.status === filter && !item.dismissed;
  });
  const acceptedCount = FEEDBACK_ITEMS.filter(
    (item) => item.status === "accepted" && !item.dismissed,
  ).length;
  const declinedCount = FEEDBACK_ITEMS.filter(
    (item) => item.status === "declined" && !item.dismissed,
  ).length;
  const pendingCount = FEEDBACK_ITEMS.filter(
    (item) => item.status === "pending" && !item.dismissed,
  ).length;
  const dismissedCount = FEEDBACK_ITEMS.filter((item) => item.dismissed).length;

  const submitIdea = () => {
    setIdeaInput("");
    setSelectedTags([]);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        <button
          type="button"
          className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2  w-max"
          onClick={() => setAdding((current) => !current)}
        >
          New idea
          <ChevronRight size={18} className={`${adding && "rotate-90"}`} />
        </button>

        {adding ? (
          <>
            <input
              type="text"
              placeholder="I'd like this feature added..."
              className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
              value={ideaInput}
              onChange={(event) => setIdeaInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submitIdea();
                }
              }}
            />

            <div className="flex items-center justify-start gap-2 w-full">
              {TAGS.map((tag) => {
                const selected = selectedTags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    className={`px-1.5 py-0.5 rounded-md border ${!selected ? "border-(--gray-page) text-(--gray-page) hover:bg-(--gray)/20" : "bg-(--light)/10 hover:bg-(--light)/15"}`}
                    onClick={() =>
                      setSelectedTags((currentTags) =>
                        selected
                          ? currentTags.filter(
                              (currentTag) => currentTag !== tag,
                            )
                          : [...currentTags, tag],
                      )
                    }
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="w-max rounded-md py-1 px-2 bg-(--vibrant) hover:bg-(--vibrant-hover)"
              onClick={submitIdea}
            >
              Submit
            </button>
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-2 @[45rem]:flex items-center justify-between @[45rem]:justify-start w-full gap-2">
        <button
          type="button"
          className="flex items-center justify-center gap-1 w-full @[45rem]:w-max rounded-md px-2 py-1 border text-(--gray-page) border-(--gray-page) hover:bg-(--gray)/20"
          onClick={() =>
            setLayout((currentLayout) =>
              currentLayout === "grid" ? "list" : "grid",
            )
          }
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
          type="button"
          className={`flex items-center justify-center gap-1 w-full @[45rem]:w-max rounded-md px-2 py-1 border ${filter !== "accepted" ? "text-(--gray-page) border-(--gray-page) hover:bg-(--gray)/20" : "bg-(--light)/10 hover:bg-(--light)/15"}`}
          onClick={() => toggleFilter("accepted")}
        >
          <ThumbsUp size={16} className="shrink-0" />
          Accepted ({acceptedCount})
        </button>
        <button
          type="button"
          className={`flex items-center justify-center gap-1 w-full @[45rem]:w-max rounded-md px-2 py-1 border ${filter !== "declined" ? "text-(--gray-page) border-(--gray-page) hover:bg-(--gray)/20" : "bg-(--light)/10 hover:bg-(--light)/15"}`}
          onClick={() => toggleFilter("declined")}
        >
          <ThumbsDown size={16} className="shrink-0" />
          Declined ({declinedCount})
        </button>
        <button
          type="button"
          className={`flex items-center justify-center gap-1 w-full @[45rem]:w-max rounded-md px-2 py-1 border ${filter !== "pending" ? "text-(--gray-page) border-(--gray-page) hover:bg-(--gray)/20" : "bg-(--light)/10 hover:bg-(--light)/15"}`}
          onClick={() => toggleFilter("pending")}
        >
          <Hourglass size={16} className="shrink-0" />
          Pending ({pendingCount})
        </button>
        <button
          type="button"
          className={`flex items-center justify-center gap-1 w-full @[45rem]:w-max rounded-md px-2 py-1 border ${filter !== "dismissed" ? "text-(--gray-page) border-(--gray-page) hover:bg-(--gray)/20" : "bg-(--light)/10 hover:bg-(--light)/15"}`}
          onClick={() => toggleFilter("dismissed")}
        >
          <X size={16} className="shrink-0" />
          Dismissed ({dismissedCount})
        </button>
      </div>

      {layout === "grid" ? (
        <div
          className={`w-full flex flex-col @[40rem]:grid ${visibleItems.length === 1 ? "grid-cols-[repeat(auto-fit,minmax(280px,500px))]" : "grid-cols-[repeat(auto-fit,minmax(280px,1fr))]"} gap-2`}
        >
          {visibleItems.map((item) => (
            <div
              key={item.feature}
              className={`rounded-md border px-2 gap-1 justify-between py-1.5 w-full min-w-0 flex flex-col min-h-0 ${
                item.status === "pending"
                  ? "border-(--gray) bg-(--gray)/10"
                  : item.status === "accepted"
                    ? "border-(--accepted-border) bg-(--accepted-bg)/10"
                    : item.status === "declined" &&
                      "border-(--declined-border) bg-(--declined-bg)/10"
              }
                   `}
            >
              <span className="font-semibold">
                <span className="rounded-sm font-normal text-(--gray-page)">
                  {item.tags.join(", ")} -{" "}
                </span>
                {item.feature}
              </span>
              {item.status === "pending" && (
                <span className="font-medium">Pending...</span>
              )}
              {item.reason && (
                <span className="font-medium">
                  {item.status === "accepted" ? "Accepted: " : "Declined: "}{" "}
                  <span className="font-normal">{item.reason}</span>
                </span>
              )}
              <div className="w-full flex items-center gap-1">
                <button
                  type="button"
                  className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm  w-full border border-(--gray)  hover:bg-(--gray)/20"
                >
                  <Trash size={16} />
                  Delete
                </button>
                <button
                  type="button"
                  className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm  w-full border border-(--gray)  hover:bg-(--gray)/20"
                >
                  {item.dismissed ? (
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
        <div className="w-full max-w-full min-w-0 overflow-x-auto border rounded-md border-(--gray)">
          <div className="min-w-225 flex flex-col">
            <div
              className={`w-full text-(--gray-page) ${visibleItems.length > 0 && "border-b"} border-(--gray) text-left grid justify-between items-start grid-cols-13 bg-(--darkest)`}
            >
              <span className="flex items-center justify-center border-r p-2 border-(--gray) h-full text-wrap">
                <Pencil size={16} />
              </span>
              <span className="border-r p-2 col-span-2 border-(--gray) h-full text-wrap">
                Status
              </span>
              <span className="p-2 col-span-2 border-r border-(--gray) h-full text-wrap">
                Tags
              </span>
              <span className="p-2 col-span-4 border-r border-(--gray) h-full text-wrap">
                Feature
              </span>
              <span className="text-wrap p-2 col-span-4 h-full">Reason?</span>
            </div>

            {visibleItems.map((item, index) => (
              <div
                className={`w-full ${index !== visibleItems.length - 1 && "border-b"} border-(--gray) text-left grid justify-between items-start grid-cols-13 ${index % 2 !== 0 && "bg-(--gray)/10"}`}
                key={item.feature}
              >
                <div className="flex py-2 border-r border-(--gray) h-full justify-around">
                  <button
                    type="button"
                    className="gap-1 flex items-center justify-center p-1.5 rounded-sm h-max aspect-square  hover:bg-(--gray)/20"
                  >
                    <Trash size={16} />
                  </button>
                  <button
                    type="button"
                    className="gap-1 flex items-center justify-center p-1.5 rounded-sm h-max aspect-square  hover:bg-(--gray)/20"
                  >
                    {item.dismissed ? (
                      <TimerReset size={16} />
                    ) : (
                      <X size={16} />
                    )}
                  </button>
                </div>
                <span
                  className={`p-2 border-r border-(--gray) h-full text-wrap col-span-2 text-left ${
                    item.status === "accepted"
                      ? "text-(--accepted-border)"
                      : item.status === "declined" && "text-(--declined-border)"
                  } capitalize`}
                >
                  {item.status}
                </span>
                <span className="p-2 border-r border-(--gray) h-full text-wrap col-span-2 text-left">
                  {item.tags.join(", ")}
                </span>
                <span className="p-2 col-span-4 border-r border-(--gray) h-full text-wrap text-left">
                  {item.feature}
                </span>
                <span className="text-wrap p-2 px-2 col-span-4 h-full text-left">
                  {item.reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
