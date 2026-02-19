"use client";
import { ChevronRight, File, Settings } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface SidebarItemProps {
  title: string;
  items: string[];
  id: string;
}

export const FileItem = ({ title, items, id }: SidebarItemProps) => {
  const [itemExpanded, setItemExpanded] = useState(false);
  return (
    <>
      <Link
        className="rounded-lg p-1 gap-2 hover:bg-(--darkest-hover) w-full text-(--gray) flex items-center justify-start  md:text-base text-sm"
        onClick={() => setItemExpanded(!itemExpanded)}
        href={"/" + id}
      >
        <ChevronRight className={`${itemExpanded ? "rotate-90" : ""}`} />
        {title}
      </Link>

      {itemExpanded && (
        <Link
          className="pl-8 flex w-full items-center  justify-start gap-2 hover:bg-(--darkest-hover) rounded-lg p-1 md:text-base text-sm"
          href={"/" + id}
        >
          <File size={20} />
          Landing
        </Link>
      )}

      {itemExpanded
        ? items.map((item, index) => (
            <Link
              className="pl-8 flex w-full items-center  justify-start gap-2 hover:bg-(--darkest-hover) rounded-lg p-1 md:text-base text-sm"
              key={index}
              href={"/" + id + "/" + item.toLowerCase()}
            >
              <File size={20} />
              {item}
            </Link>
          ))
        : null}
    </>
  );
};
