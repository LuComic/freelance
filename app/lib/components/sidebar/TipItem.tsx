"use client";
import { ChevronRight, StickyNote } from "lucide-react";
import { useState } from "react";

interface TipItemProps {
  title: string;
  description: string;
}

export const TipItem = ({ title, description }: TipItemProps) => {
  const [itemExpanded, setItemExpanded] = useState(false);
  return (
    <>
      <button
        className="rounded-lg p-1 gap-2 hover:bg-(--darkest-hover) w-full text-(--gray) flex items-center justify-start cursor-pointer md:text-base text-sm"
        onClick={() => setItemExpanded(!itemExpanded)}
      >
        <ChevronRight className={`${itemExpanded ? "rotate-90" : ""}`} />
        {title}
      </button>
      {itemExpanded ? (
        <p className="pl-8 flex w-full items-center cursor-pointer justify-start gap-2 hover:bg-(--darkest-hover) rounded-lg p-1 md:text-base text-sm font-light">
          <StickyNote size={20} />
          {description}
        </p>
      ) : null}
    </>
  );
};
