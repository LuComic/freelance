"use client";

import { ChevronRight, Settings } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";

interface SidebarItemProps {
  title: string;
  items: string[];
  setSidebarOpen?: Dispatch<SetStateAction<boolean>>;
}

export const SettingsItem = ({
  title,
  items,
  setSidebarOpen,
}: SidebarItemProps) => {
  const [itemExpanded, setItemExpanded] = useState(false);
  const closeSidebar = () => setSidebarOpen?.(false);

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
              onClick={closeSidebar}
            >
              <Settings size={20} />
              {item}
            </Link>
          ))
        : null}
    </>
  );
};
