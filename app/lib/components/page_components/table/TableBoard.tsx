"use client";

import { useState } from "react";
import type { PageComponentLiveStateByType } from "@/lib/pageDocument";

type TableState = PageComponentLiveStateByType<"Table">["state"];

type TableBoardProps = {
  liveState: TableState;
  editable?: boolean;
  onCellChange?: (column: number, row: number, value: string) => void;
  onCellDelete?: (column: number, row: number) => void;
};

function getCell(cells: TableState["cells"], row: number, column: number) {
  return cells.find((cell) => cell.row === row && cell.column === column);
}

export const TableBoard = ({
  liveState,
  editable = false,
  onCellChange,
  onCellDelete,
}: TableBoardProps) => {
  const [editingCell, setEditingCell] = useState<{
    row: number;
    column: number;
  } | null>(null);
  const [draftValue, setDraftValue] = useState("");

  const commitEdit = () => {
    if (!editingCell) return;

    if (draftValue.trim() === "") {
      onCellDelete?.(editingCell.column, editingCell.row);
      setEditingCell(null);
      return;
    }

    onCellChange?.(editingCell.column, editingCell.row, draftValue);
    setEditingCell(null);
  };

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-auto border rounded-md border-(--gray)">
      <div className="min-w-225 flex flex-col">
        {Array.from({ length: liveState.rows }).map((_, rowIndex) => {
          const row = rowIndex + 1;

          return (
            <div
              key={row}
              className={`w-full ${rowIndex !== liveState.rows - 1 && "border-b"} border-(--gray) text-left grid justify-between items-start ${rowIndex % 2 !== 0 && "bg-(--gray)/10"}`}
              style={{
                gridTemplateColumns: `repeat(${liveState.columns}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: liveState.columns }).map(
                (_, columnIndex) => {
                  const column = columnIndex + 1;
                  const cell = getCell(liveState.cells, row, column);
                  const value = cell?.value ?? "";
                  const isEditing =
                    editingCell?.row === row && editingCell.column === column;

                  return (
                    <div
                      key={column}
                      className="p-2 border-r border-(--gray) last:border-r-0 min-h-10 h-full flex flex-col items-start justify-start gap-2 text-wrap"
                      style={{
                        backgroundColor: cell?.color
                          ? `color-mix(in srgb, var(--${cell.color}) 40%, transparent)`
                          : undefined,
                      }}
                      onClick={() => {
                        if (!editable) return;
                        setEditingCell({ row, column });
                        setDraftValue(value);
                      }}
                    >
                      {editable && isEditing ? (
                        <input
                          autoFocus
                          className="w-full outline-none border-none"
                          value={draftValue}
                          onChange={(event) =>
                            setDraftValue(event.target.value)
                          }
                          onBlur={commitEdit}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") commitEdit();
                          }}
                          onClick={(event) => event.stopPropagation()}
                        />
                      ) : (
                        <span className="min-w-0 wrap-break-word">{value}</span>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
