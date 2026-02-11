"use client";

import { useState } from "react";
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

export const FeedbackCreator = () => {
  return (
    <>
      <p className="md:text-xl text-lg font-medium">Client's ideas</p>
      <p className="text-(--gray-page)">
        Here you can accept or decline the ideas proposed by the client and give
        an explanation to your decision.
      </p>
    </>
  );
};
