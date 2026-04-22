"use client";

import { useEffect, useRef } from "react";
import { CopyX, MoveLeft, MoveRight, SquareX, X } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface TabItemProps {
  title: string;
  contextLabel: string;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
  onCloseAll: () => void;
  onCloseOthers: () => void;
  onCloseRight: () => void;
  onCloseLeft: () => void;
}

function truncateLabel(value: string, maxLength = 8) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

export const TabItem = ({
  title,
  contextLabel,
  isActive,
  onSelect,
  onClose,
  onCloseAll,
  onCloseOthers,
  onCloseRight,
  onCloseLeft,
}: TabItemProps) => {
  const tabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    tabRef.current?.scrollIntoView();
  }, [isActive]);

  return (
    <ContextMenu>
      <ContextMenuTrigger
        ref={tabRef}
        className={`flex h-9 min-w-37.5 shrink-0 items-center border-b-0 border-l-0 border-r border-t border-(--gray) overscroll-y-none ${
          isActive ? "bg-(--quite-dark)" : "bg-(--dim) hover:bg-(--darkest)"
        }`}
      >
        <button
          type="button"
          className="min-w-0 flex-1 px-3 py-2 text-left"
          onClick={onSelect}
        >
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <span
              className={`truncate ${isActive ? "text-(--light)" : "text-(--gray-page)"}`}
            >
              {truncateLabel(title)}
            </span>
            <span className="truncate text-(--gray-page)">
              {truncateLabel(contextLabel)}
            </span>
          </span>
        </button>
        <button
          type="button"
          className="mr-2 rounded-md p-1 text-(--gray) hover:bg-(--gray)/20 hover:text-(--light)"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
        >
          <X size={16} />
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
        <ContextMenuItem
          className="data-highlighted:bg-(--darkest) data-highlighted:text-(--light) text-xs"
          onSelect={() => onClose()}
        >
          <X />
          Close
        </ContextMenuItem>
        <ContextMenuItem
          className="data-highlighted:bg-(--darkest) data-highlighted:text-(--light) text-xs"
          onSelect={() => onCloseAll()}
        >
          <SquareX />
          Close all
        </ContextMenuItem>
        <ContextMenuItem
          className="data-highlighted:bg-(--darkest) data-highlighted:text-(--light) text-xs"
          onSelect={() => onCloseOthers()}
        >
          <CopyX />
          Close others
        </ContextMenuItem>
        <ContextMenuItem
          className="data-highlighted:bg-(--darkest) data-highlighted:text-(--light) text-xs"
          onSelect={() => onCloseRight()}
        >
          <MoveRight />
          Close right
        </ContextMenuItem>
        <ContextMenuItem
          className="data-highlighted:bg-(--darkest) data-highlighted:text-(--light) text-xs"
          onSelect={() => onCloseLeft()}
        >
          <MoveLeft />
          Close left
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
