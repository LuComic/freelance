import React from "react";
import { TabItem } from "./TabItem";

const TABS = [
  "Preferences",
  "Feedback",
  "Progress",
  "Settings",
  "Apple",
  "Pear",
  "Potato",
  "Melon",
  "Grapefruit",
  "Potato",
  "Melon",
  "Grapefruit",
];

export const Tab = () => {
  return (
    <div className="auto hidden md:flex items-center justify-start max-w-full w-full border-b border-(--gray) overflow-x-scroll">
      {TABS.length > 0 &&
        TABS.map((tab, index) => <TabItem key={index} title={tab} />)}
    </div>
  );
};
