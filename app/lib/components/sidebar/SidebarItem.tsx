"use client";
import { ChevronRight, File, Settings } from "lucide-react";
import { useState } from "react";

interface SidebarItemProps {
  title: string;
  items: string[];
  connections?: boolean;
  settings?: boolean;
}

export const SidebarItem = ({
  title,
  items,
  connections,
  settings,
}: SidebarItemProps) => {
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
        ? items.map((item, index) => (
            <span
              className="pl-8 flex w-full items-center cursor-pointer justify-start gap-2 hover:bg-(--darkest-hover) rounded-lg p-1 md:text-base text-sm"
              key={index}
            >
              {connections ? (
                <div className="aspect-square w-7 h-auto bg-(--dim) rounded-full"></div>
              ) : settings ? (
                <Settings size={20} />
              ) : (
                <File size={20} />
              )}
              {item}
            </span>
          ))
        : null}
    </>
  );
};
