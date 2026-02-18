"use client";

import { useEffect, useRef, useState } from "react";
import { SearchBarItem } from "./SearchBarItem";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

const PLACEHOLDER_FILES = [
  "Docs",
  "Components",
  "Blocks",
  "Charts",
  "Directory",
  "Create",
  "Accordion",
  "Button",
  "Card",
  "Dialog",
  "Input",
  "Select",
  "Table",
  "Tabs",
  "Toast",
];

export const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  const filteredFiles = PLACEHOLDER_FILES.filter((file) =>
    file.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setSelectedIndex(0);
      }

      if (!isOpen) return;

      // Close on Escape
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
        setSelectedIndex(0);
      }

      // Navigate with arrow keys
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredFiles.length - 1 ? prev + 1 : prev,
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }

      // Enter to select
      if (e.key === "Enter" && filteredFiles.length > 0) {
        e.preventDefault();
        console.log("Selected:", filteredFiles[selectedIndex]);
        // Add your navigation logic here
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredFiles, selectedIndex]);

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Keep selected item in view when navigating with arrow keys
  useEffect(() => {
    if (filteredFiles.length === 0) return;
    selectedItemRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selectedIndex, filteredFiles.length]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-start justify-center pt-[10vh] bg-black/60"
      onClick={() => {
        setIsOpen(false);
        setSearchQuery("");
        setSelectedIndex(0);
      }}
    >
      <div
        className="w-full max-w-2xl bg-(--darkest) rounded-xl overflow-hidden border border-(--gray)"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-(--darkest-hover)">
          <svg
            className="w-5 h-5 text-(--gray)"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent text-(--light) text-base outline-none placeholder:text-(--gray)"
            autoFocus
          />
          <KbdGroup>
            <Kbd className="bg-(--gray) text-(--light)">Ctrl + K</Kbd>
          </KbdGroup>
        </div>

        {/* File List */}
        <div className="flex flex-col gap-1 w-full max-h-96 overflow-y-auto p-2">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file, index) => (
              <SearchBarItem
                key={file}
                ref={index === selectedIndex ? selectedItemRef : null}
                title={file}
                isSelected={index === selectedIndex}
              />
            ))
          ) : (
            <div className="px-4 py-8 text-center text-(--gray)">
              No files found
            </div>
          )}
        </div>

        {/* Footer with keyboard shortcuts */}
        <div className="px-4 py-3 border-t border-(--darkest-hover) flex items-center gap-6 text-sm text-(--gray)">
          <div className="flex items-center gap-2">
            <Kbd className="bg-(--gray) text-(--light)">esc</Kbd>
            <span>close</span>
          </div>
          <div className="flex items-center gap-2">
            <KbdGroup>
              <Kbd className="bg-(--gray) text-(--light)">↓</Kbd>
              <Kbd className="bg-(--gray) text-(--light)">↑</Kbd>
            </KbdGroup>
            <span>navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <Kbd className="bg-(--gray) text-(--light)">↵</Kbd>
            <span>open</span>
          </div>
        </div>
      </div>
    </div>
  );
};
