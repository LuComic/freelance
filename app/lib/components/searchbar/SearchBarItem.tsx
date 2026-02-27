"use client";

import { forwardRef } from "react";
import { ChevronRight } from "lucide-react";

interface SearchBarItemProps {
  title: string;
  subtitle?: string;
  badge?: string;
  isSelected: boolean;
  onClick?: () => void;
}

export const SearchBarItem = forwardRef<HTMLButtonElement, SearchBarItemProps>(
  ({ title, subtitle, badge, isSelected, onClick }, ref) => {
    return (
      <button
        type="button"
        ref={ref}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg  ${
          isSelected ? "bg-(--darkest-hover)" : "hover:bg-(--darkest-hover)"
        } w-full text-left`}
      >
        <ChevronRight size={20} className="text-(--gray)" />
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base">{title}</span>
            {badge ? (
              <span className="rounded-md border border-(--gray-page) px-1.5 py-0.5 text-xs text-(--gray-page)">
                {badge}
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <span className="text-sm text-(--gray-page)">{subtitle}</span>
          ) : null}
        </div>
      </button>
    );
  },
);

SearchBarItem.displayName = "SearchBarItem";
