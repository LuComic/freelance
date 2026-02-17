"use client";

import { useState, useEffect } from "react";
import { TimerReset, X } from "lucide-react";
import { setCookie, FEEDBACK_CREATOR_LAYOUT_COOKIE } from "@/app/lib/cookies";

type itemType = {
  feature: string;
  status: "Todo" | "In Progress" | "Done";
  dismissed?: boolean;
};

let IDEA_DATA: itemType[] = [
  {
    feature: "Please add an About page",
    status: "Todo",
  },
  {
    feature: "Turn the selector in X page into a slider",
    status: "In Progress",
  },
  {
    feature:
      "Create a 3D animation on the landing page that is 4k resolution and has no mistakes",
    status: "Done",
  },
];

export const KanbanCreator = () => {
  const [data, setData] = useState(IDEA_DATA);
  const [filter, setFilter] = useState<"" | "dismissed">("");

  const handleDismissing = (item: itemType) => {
    setData((prev) =>
      prev.map((p) =>
        p.feature === item.feature
          ? { ...p, dismissed: !(p.dismissed && p.dismissed === true) }
          : p,
      ),
    );
  };

  const changeFilter = () => {
    if (filter === "dismissed") {
      setFilter("");
      return;
    }

    setFilter("dismissed");
  };

  const visibleData = data.filter((item) => {
    if (filter === "dismissed") {
      return item.dismissed && item.dismissed === true;
    }
    // By default show only non‑dismissed items
    return !item.dismissed;
  });

  return (
    <>
      <p className="md:text-xl text-lg font-medium">Current Progress</p>
      <p className="text-(--gray-page)">
        Here you can display the progress of your work as a kanban list. The
        table is divided into "Todo" (features/things to do or fix), "In
        progress" (things that are currently being developed or fixed) and
        "Done" (list of the completed tasks)
      </p>
      {/* <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        <button
          className="md:text-lg text-base font-medium flex items-center justify-start gap-2 cursor-pointer w-max"
          onClick={() => setEditing((prev) => !prev)}
        >
          Possible
          <ChevronRight size={18} className={`${editing && "rotate-90"}`} />
        </button>
        {editing && (
          <>
            <input
              type="text"
              placeholder="Add a new possible tag..."
              className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNewTag();
                }
              }}
            />

            <div className="flex items-center justify-start gap-2 w-full">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="pl-1.5 pr-0.5 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    className="cursor-pointer hover:bg-(--gray)/20 p-1 rounded-sm"
                    onClick={() => deleteTag(tag)}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              className="w-max rounded-md px-2.5 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) cursor-pointer"
              onClick={handleNewTag}
            >
              Submit
            </button>
          </>
        )}
      </div> */}

      <div className="grid grid-cols-2 md:flex items-center justify-between md:justify-start w-full gap-2">
        <button
          className={`flex items-center justify-center gap-1 w-full md:w-max rounded-md px-2.5 py-1 border ${filter !== "dismissed" && "text-(--gray-page) border-(--gray-page)"} cursor-pointer hover:bg-(--gray)/20`}
          onClick={() => changeFilter()}
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
      {filter === "dismissed" ? (
        <div
          className={`w-full flex flex-col md:grid ${visibleData.length === 1 ? "grid-cols-[repeat(auto-fit,minmax(280px,500px))]" : "grid-cols-[repeat(auto-fit,minmax(280px,1fr))]"}  gap-2`}
        >
          {visibleData.map((feature) => (
            <div
              key={feature.feature}
              className="rounded-md border px-2 gap-1 justify-between py-1.5 w-full min-w-0 flex flex-col min-h-0 border-(--gray) bg-(--gray)/10"
            >
              <span className="font-semibold">{feature.feature}</span>
              <div className="w-full flex items-center gap-1">
                <button
                  className="gap-1 flex items-center justify-center px-2.5 py-1 rounded-sm  w-full border border-(--gray) cursor-pointer hover:bg-(--gray)/20"
                  onClick={() => handleDismissing(feature)}
                >
                  <TimerReset size={16} />
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full max-w-full min-w-0 overflow-x-auto">
          <div className="min-w-[800px] flex flex-col">
            {/* Header row with narrow State column and wider status columns */}
            <div className="w-full text-(--gray-page) border-b border-(--gray) text-left grid justify-between items-start grid-cols-10 bg-(--darkest)">
              <span className="flex items-center justify-center border-r p-2 border-(--gray) h-full text-wrap">
                State
              </span>
              <span className="border-r p-2 col-span-3 border-(--gray) h-full text-wrap">
                Todo
              </span>
              <span className="p-2 col-span-3 border-r border-(--gray) h-full text-wrap">
                In Progress
              </span>
              <span className="text-wrap p-2 col-span-3 h-full">Done</span>
            </div>

            {visibleData.map((feature, index) => (
              <div
                key={feature.feature}
                className={`w-full border-(--gray) text-left grid justify-between items-stretch grid-cols-10 ${
                  index !== visibleData.length - 1 ? "border-b" : ""
                } ${index % 2 !== 0 ? "bg-(--gray)/10" : ""}`}
              >
                <div className="flex py-2 border-r border-(--gray) h-full justify-around items-center gap-1 flex-wrap">
                  <button
                    className="gap-1 flex items-center justify-center p-1.5 rounded-sm h-max aspect-square cursor-pointer hover:bg-(--gray)/20"
                    onClick={() => handleDismissing(feature)}
                  >
                    <X size={16} />
                  </button>
                </div>

                <span className="p-2 border-r border-(--gray) h-full text-wrap col-span-3 flex items-start">
                  {feature.status === "Todo" && feature.feature}
                </span>

                <span className="p-2 border-r border-(--gray) h-full text-wrap col-span-3 flex items-start">
                  {feature.status === "In Progress" && feature.feature}
                </span>

                <span className="text-wrap p-2 col-span-3 h-full flex items-start">
                  {feature.status === "Done" && feature.feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
