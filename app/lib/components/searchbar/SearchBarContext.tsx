"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type SearchTag = "people" | "template";

type SearchBarContextValue = {
  isOpen: boolean;
  activeTag: SearchTag | null;
  openSearch: () => void;
  openTaggedSearch: (tag: SearchTag) => void;
  closeSearch: () => void;
  clearTag: () => void;
};

const SearchBarContext = createContext<SearchBarContextValue | null>(null);

export const SearchBarProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<SearchTag | null>(null);

  const value = useMemo(
    () => ({
      isOpen,
      activeTag,
      openSearch: () => setIsOpen(true),
      openTaggedSearch: (tag: SearchTag) => {
        setActiveTag(tag);
        setIsOpen(true);
      },
      closeSearch: () => {
        setIsOpen(false);
        setActiveTag(null);
      },
      clearTag: () => setActiveTag(null),
    }),
    [activeTag, isOpen],
  );

  return (
    <SearchBarContext.Provider value={value}>
      {children}
    </SearchBarContext.Provider>
  );
};

export const useSearchBar = () => {
  const context = useContext(SearchBarContext);

  if (!context) {
    throw new Error("useSearchBar must be used within SearchBarProvider");
  }

  return context;
};
