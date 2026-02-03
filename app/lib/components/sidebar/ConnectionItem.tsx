"use client";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface ConnectionItemProps {
  title: string;
  connections: string[];
}

export const ConnectionItem = ({ title, connections }: ConnectionItemProps) => {
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
      {itemExpanded
        ? connections.map((connection) => (
            <span
              className="pl-8 flex w-full items-center cursor-pointer justify-start gap-2 hover:bg-(--darkest-hover) rounded-lg p-1 md:text-base text-sm font-light"
              key={connection}
            >
              <div className="aspect-square w-7 h-auto bg-(--dim) rounded-full"></div>
              {connection}
            </span>
          ))
        : null}
    </>
  );
};
