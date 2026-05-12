"use client";

import { useState } from "react";
import type { PageComponentLiveStateByType } from "@/lib/pageDocument";

type TableState = PageComponentLiveStateByType<"Table">["state"];

type TableBoardProps = {
  liveState: TableState;
  editable?: boolean;
  onCellChange?: (row: number, column: number, value: string) => void;
};

function getCellValue(cells: TableState["cells"], row: number, column: number) {
  return (
    cells.find((cell) => cell.row === row && cell.column === column)?.value ??
    ""
  );
}

export const TableBoard = ({
  liveState,
  editable = false,
  onCellChange,
}: TableBoardProps) => {
  const [editingCell, setEditingCell] = useState<{
    row: number;
    column: number;
  } | null>(null);
  const [draftValue, setDraftValue] = useState("");

  const commitEdit = () => {
    if (!editingCell) return;
    onCellChange?.(editingCell.row, editingCell.column, draftValue);
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
                  const value = getCellValue(liveState.cells, row, column);
                  const isEditing =
                    editingCell?.row === row && editingCell.column === column;

                  return (
                    <div
                      key={column}
                      className="p-2 border-r border-(--gray) last:border-r-0 min-h-10 h-full flex flex-col items-start justify-start gap-2 text-wrap"
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
