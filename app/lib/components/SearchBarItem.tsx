"use client";

import { ChevronRight } from "lucide-react";

interface SearchBarItemProps {
  title: string;
  isSelected: boolean;
}

export const SearchBarItem = ({ title, isSelected }: SearchBarItemProps) => {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
        isSelected ? "bg-(--darkest-hover)" : "hover:bg-(--darkest-hover)"
      }`}
    >
      <ChevronRight size={20} className="text-(--gray)" />
      <span className="text-base">{title}</span>
    </div>
  );
};
