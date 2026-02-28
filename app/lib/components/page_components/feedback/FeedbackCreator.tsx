"use client";

import { useState, useEffect } from "react";
import {
  ThumbsDown,
  ThumbsUp,
  TimerReset,
  X,
  Table,
  LayoutGrid,
  ChevronRight,
  Trash,
} from "lucide-react";
import {
  getCookie,
  setCookie,
  FEEDBACK_CREATOR_LAYOUT_COOKIE,
} from "@/app/lib/cookies";
import { ReviewModal } from "./ReviewModal";
import type {
  PageComponentInstanceByType,
  PageComponentLiveStateByType,
} from "@/lib/pageDocument";

type FeedbackCreatorProps = {
  config: PageComponentInstanceByType<"Feedback">["config"];
  liveState: PageComponentLiveStateByType<"Feedback">["state"];
  onChangeConfig: (
    updater: (
      config: PageComponentInstanceByType<"Feedback">["config"],
    ) => PageComponentInstanceByType<"Feedback">["config"],
  ) => void;
  onChangeLiveState: (
    updater: (
      state: PageComponentLiveStateByType<"Feedback">["state"],
    ) => PageComponentLiveStateByType<"Feedback">["state"],
  ) => void;
};

export const FeedbackCreator = ({
  config,
  liveState,
  onChangeConfig,
  onChangeLiveState,
}: FeedbackCreatorProps) => {
  const [tagInput, setTagInput] = useState("");
  const [editing, setEditing] = useState(false);
  const [filter, setFilter] = useState<
    "" | "accepted" | "declined" | "pending" | "dismissed"
  >("");
  const [layout, setLayout] = useState<"grid" | "list">(() => {
    const cookieLayout = getCookie(FEEDBACK_CREATOR_LAYOUT_COOKIE);

    if (cookieLayout === "grid" || cookieLayout === "list") {
      return cookieLayout;
    }

    return "grid";
  });

  useEffect(() => {
    setCookie(FEEDBACK_CREATOR_LAYOUT_COOKIE, layout);
  }, [layout]);

  const handleNewTag = () => {
    if (tagInput.trim() === "") return;
    onChangeConfig((currentConfig) => ({
      ...currentConfig,
      tags: [tagInput.trim(), ...currentConfig.tags],
    }));
    setTagInput("");
  };

  const deleteTag = (tag: string) => {
    onChangeConfig((currentConfig) => ({
      ...currentConfig,
      tags: currentConfig.tags.filter((t) => t !== tag),
    }));
  };

  const handleDismissing = (feature: string) => {
    onChangeLiveState((currentLiveState) => ({
      ...currentLiveState,
      items: currentLiveState.items.map((item) =>
        item.feature === feature
          ? { ...item, dismissed: !(item.dismissed && item.dismissed === true) }
          : item,
      ),
    }));
  };

  const updateFeatureReview = (
    featureName: string,
    action: "accept" | "decline",
    reason: string,
  ) => {
    onChangeLiveState((currentLiveState) => ({
      ...currentLiveState,
      items: currentLiveState.items.map((item) =>
        item.feature === featureName
          ? {
              ...item,
              status: action === "accept" ? "accepted" : "declined",
              reason,
            }
          : item,
      ),
    }));
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
      ? liveState.items.filter(
          (item) => !item.dismissed && item.status === "pending",
        )
      : liveState.items.filter((item) => {
          if (filter === "dismissed") {
            return item.dismissed && item.dismissed === true;
          }
          return item.status === filter && !item.dismissed;
        });

  return (
    <>
      <p className="@[40rem]:text-xl text-lg font-medium">
        Client&apos;s ideas
      </p>
      <p className="text-(--gray-page)">
        Here you can accept or decline the ideas proposed by the client and give
        an explanation to your decision.
      </p>
      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        <button
          className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2  w-max"
          onClick={() => setEditing((prev) => !prev)}
        >
          Tags
          <ChevronRight size={18} className={`${editing && "rotate-90"}`} />
        </button>
        {editing && (
          <>
            <input
              type="text"
              placeholder="Add a new tag..."
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
              {config.tags.map((tag) => (
                <div
                  key={tag}
                  className="pl-1.5 pr-0.5 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    className=" hover:bg-(--gray)/20 p-1 rounded-sm"
                    onClick={() => deleteTag(tag)}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) "
              onClick={handleNewTag}
            >
              Submit
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 @[40rem]:flex items-center justify-between @[40rem]:justify-start w-full gap-2">
        <button
          className="flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border text-(--gray-page) border-(--gray-page)  hover:bg-(--gray)/20"
          onClick={() => {
            const nextLayout = layout === "grid" ? "list" : "grid";
            setCookie(FEEDBACK_CREATOR_LAYOUT_COOKIE, nextLayout);
            setLayout(nextLayout);
          }}
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
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "accepted" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
          onClick={() => changeFilter("accepted")}
        >
          <ThumbsUp size={16} />
          Accepted
        </button>
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "declined" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
          onClick={() => changeFilter("declined")}
        >
          <ThumbsDown size={16} />
          Declined
        </button>
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "dismissed" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
          onClick={() => changeFilter("dismissed")}
        >
          <X size={16} />
          Dismissed (
          {
            liveState.items.filter(
              (item) => item.dismissed && item.dismissed === true,
            ).length
          }
          )
        </button>
      </div>
      {layout === "grid" ? (
        <div
          className={`w-full flex flex-col @[40rem]:grid ${visibleData.length === 1 ? "grid-cols-[repeat(auto-fit,minmax(280px,500px))]" : "grid-cols-[repeat(auto-fit,minmax(280px,1fr))]"}  gap-2`}
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
                  {feature.tags.join(", ")} -{" "}
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
                    action={
                      feature.status === "accepted" ? "decline" : "accept"
                    }
                    feature={feature}
                    onSubmit={(reason) =>
                      updateFeatureReview(
                        feature.feature,
                        feature.status === "accepted" ? "decline" : "accept",
                        reason,
                      )
                    }
                  />
                ) : (
                  <>
                    <ReviewModal
                      action="accept"
                      feature={feature}
                      onSubmit={(reason) =>
                        updateFeatureReview(feature.feature, "accept", reason)
                      }
                    />
                    <ReviewModal
                      action="decline"
                      feature={feature}
                      onSubmit={(reason) =>
                        updateFeatureReview(feature.feature, "decline", reason)
                      }
                    />
                  </>
                )}
                <button
                  className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm  w-full border border-(--gray)  hover:bg-(--gray)/20"
                  onClick={() => handleDismissing(feature.feature)}
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
        <div className="w-full max-w-full min-w-0 overflow-x-auto border rounded-md border-(--gray)">
          <div className="min-w-[900px] flex flex-col">
            <div
              className={`w-full text-(--gray-page) ${visibleData.length > 0 && "border-b"} border-(--gray) text-left grid justify-between items-start grid-cols-13 bg-(--darkest)`}
            >
              <span className="border-r p-2 border-(--gray) h-full text-wrap">
                Actions
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
            {visibleData.map((feature, index) => (
              <div
                className={`w-full ${index !== visibleData.length - 1 && "border-b"} border-(--gray) text-left grid justify-between items-start grid-cols-13 ${index % 2 !== 0 && "bg-(--gray)/10"}`}
                key={feature.feature}
              >
                <div className="flex py-2 border-r border-(--gray) h-full justify-around items-center gap-1 flex-wrap">
                  {feature.status !== "pending" ? (
                    <ReviewModal
                      action={
                        feature.status === "accepted" ? "decline" : "accept"
                      }
                      feature={feature}
                      listView
                      onSubmit={(reason) =>
                        updateFeatureReview(
                          feature.feature,
                          feature.status === "accepted" ? "decline" : "accept",
                          reason,
                        )
                      }
                    />
                  ) : (
                    <>
                      <ReviewModal
                        action="accept"
                        feature={feature}
                        listView
                        onSubmit={(reason) =>
                          updateFeatureReview(feature.feature, "accept", reason)
                        }
                      />
                      <ReviewModal
                        action="decline"
                        feature={feature}
                        listView
                        onSubmit={(reason) =>
                          updateFeatureReview(
                            feature.feature,
                            "decline",
                            reason,
                          )
                        }
                      />
                    </>
                  )}
                  <button
                    className="gap-1 flex items-center justify-center p-1.5 rounded-sm h-max aspect-square  hover:bg-(--gray)/20"
                    onClick={() => handleDismissing(feature.feature)}
                  >
                    {feature.dismissed && feature.dismissed === true ? (
                      <TimerReset size={16} />
                    ) : (
                      <X size={16} />
                    )}
                  </button>
                </div>
                <span
                  className={`p-2 border-r border-(--gray) h-full text-wrap col-span-2 text-left ${feature.status === "accepted" ? "text-(--accepted-border)" : feature.status === "declined" && "text-(--declined-border)"} capitalize`}
                >
                  {feature.status}
                </span>
                <span className="p-2 border-r border-(--gray) h-full text-wrap col-span-2 text-left">
                  {feature.tags.join(", ")}
                </span>
                <span className="p-2 col-span-4 border-r border-(--gray) h-full text-wrap text-left">
                  {feature.feature}
                </span>
                <span className="text-wrap p-2 col-span-4 h-full text-left">
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
