"use client";

import { ChevronRight, Settings } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface SidebarItemProps {
  title: string;
  items: string[];
}

export const SettingsItem = ({ title, items }: SidebarItemProps) => {
  const [itemExpanded, setItemExpanded] = useState(false);
  return (
    <>
      <button
        className="rounded-lg p-1 px-1.5 gap-2 hover:bg-(--darkest-hover) w-full text-(--gray) flex items-center justify-start text-base"
        onClick={() => setItemExpanded(!itemExpanded)}
      >
        <ChevronRight className={`${itemExpanded ? "rotate-90" : ""}`} />
        {title}
      </button>
      {itemExpanded
        ? items.map((item, index) => (
            <Link
              className="pl-8 flex w-full items-center  justify-start gap-2 hover:bg-(--darkest-hover) rounded-lg p-1 text-base"
              key={index}
              href={"/settings?section=" + title.toLowerCase()}
            >
              <Settings size={20} />
              {item}
            </Link>
          ))
        : null}
    </>
  );
};
