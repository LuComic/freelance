"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Trash, X } from "lucide-react";

type itemType = {
  feature: string;
  status: "pending" | "accepted" | "declined";
  type: "nice" | "req";
  reason?: string;
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

export const Feedback = () => {
  const [client, setClient] = useState(false);
  const [data, setData] = useState(IDEA_DATA);
  const [ideaInput, setIdeaInput] = useState("");
  const [niceToHave, setNiceToHave] = useState(true);

  const handleNewIdea = () => {
    const newItem: itemType = {
      feature: ideaInput,
      status: "pending",
      type: niceToHave ? "nice" : "req",
    };
    setData((prev) => [newItem, ...prev]);
    setIdeaInput("");
  };

  return (
    <div className="w-full border border-(--gray) rounded-xl px-2 py-2 flex flex-col gap-2">
      <div className="flex items-center justify-start gap-2">
        <Switch
          className="data-[state=checked]:bg-(--vibrant) data-[state=unchecked]:bg-(--dim) cursor-pointer"
          onClick={() => setClient((prev) => !prev)}
        />
        {client ? "Client's view" : "Creator's view"}
      </div>
      {client ? (
        <>
          <p className="md:text-xl text-lg font-medium">
            Submit ideas to the creator
          </p>
          <p className="text-(--gray-page)">
            Here you can submit ideas to the creator, who then either accept or
            decline them with a explanaition.
          </p>
          <div className="border-(--gray) border-y py-1.5 w-full flex flex-col gap-2">
            <span className="md:text-lg text-base font-medium">New idea</span>
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
          </div>
          <div className="w-full flex flex-col md:grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-2">
            {data.map((feature) => (
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
                    {feature.status === "accepted"
                      ? "Accepted: "
                      : "Declined: "}{" "}
                    <span className="font-normal">{feature.reason}</span>
                  </span>
                )}
                <div className="w-full flex items-center gap-1">
                  <button className="gap-1 flex items-center justify-center px-2.5 py-1 rounded-sm  w-full border border-(--gray) cursor-pointer hover:bg-(--gray)/20">
                    <Trash size={16} />
                    Delete
                  </button>
                  <button className="gap-1 flex items-center justify-center px-2.5 py-1 rounded-sm  w-full border border-(--gray) cursor-pointer hover:bg-(--gray)/20">
                    <X size={16} />
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="md:text-xl text-lg font-medium">Client's ideas</p>
          <p className="text-(--gray-page)">
            Here you can accept or decline the ideas proposed by the client and
            give an explanation to your decision.
          </p>
        </>
      )}
    </div>
  );
};
