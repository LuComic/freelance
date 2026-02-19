"use client";

import { forwardRef } from "react";
import { ChevronRight } from "lucide-react";

interface SearchBarItemProps {
  title: string;
  isSelected: boolean;
}

export const SearchBarItem = forwardRef<HTMLDivElement, SearchBarItemProps>(
  ({ title, isSelected }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg  ${
          isSelected ? "bg-(--darkest-hover)" : "hover:bg-(--darkest-hover)"
        }`}
      >
        <ChevronRight size={20} className="text-(--gray)" />
        <span className="text-base">{title}</span>
      </div>
    );
  },
);

SearchBarItem.displayName = "SearchBarItem";
