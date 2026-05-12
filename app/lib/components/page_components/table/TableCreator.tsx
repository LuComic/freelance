"use client";

import { useState } from "react";
import { ChevronRight, Trash } from "lucide-react";
import type { PageComponentLiveStateByType } from "@/lib/pageDocument";
import { MAX_FORM_TEXT_ANSWER_LENGTH } from "@/lib/inputLimits";
import { TableBoard } from "./TableBoard";

type TableState = PageComponentLiveStateByType<"Table">["state"];

type TableCreatorProps = {
  liveState: TableState;
  onChangeLiveState: (updater: (state: TableState) => TableState) => void;
};

const clampCount = (value: number) =>
  Math.min(20, Math.max(1, Math.floor(value || 1)));

export const TableCreator = ({
  liveState,
  onChangeLiveState,
}: TableCreatorProps) => {
  const [configuring, setConfiguring] = useState(false);
  const [adding, setAdding] = useState(false);
  const [rows, setRows] = useState(String(liveState.rows));
  const [columns, setColumns] = useState(String(liveState.columns));
  const [newRow, setNewRow] = useState("1");
  const [newColumn, setNewColumn] = useState("1");
  const [newValue, setNewValue] = useState("");

  const setCellValue = (row: number, column: number, value: string) => {
    onChangeLiveState((currentState) => {
      const nextValue = value.slice(0, MAX_FORM_TEXT_ANSWER_LENGTH);
      const existing = currentState.cells.find(
        (cell) => cell.row === row && cell.column === column,
      );

      if (existing) {
        return {
          ...currentState,
          cells: currentState.cells.map((cell) =>
            cell.id === existing.id ? { ...cell, value: nextValue } : cell,
          ),
        };
      }

      if (nextValue.trim() === "") return currentState;

      return {
        ...currentState,
        cells: [
          ...currentState.cells,
          { id: crypto.randomUUID(), row, column, value: nextValue },
        ],
      };
    });
  };

  const configureTable = () => {
    const nextRows = clampCount(Number(rows));
    const nextColumns = clampCount(Number(columns));

    onChangeLiveState((currentState) => ({
      ...currentState,
      rows: nextRows,
      columns: nextColumns,
      cells: currentState.cells.filter(
        (cell) => cell.row <= nextRows && cell.column <= nextColumns,
      ),
    }));
  };

  const addItem = () => {
    const row = clampCount(Number(newRow));
    const column = clampCount(Number(newColumn));
    if (
      row > liveState.rows ||
      column > liveState.columns ||
      newValue.trim() === ""
    )
      return;
    setCellValue(row, column, newValue);
    setNewValue("");
  };

  const deleteCell = (cellId: string) => {
    onChangeLiveState((currentState) => ({
      ...currentState,
      cells: currentState.cells.filter((cell) => cell.id !== cellId),
    }));
  };

  return (
    <>
      <p className="text-lg font-medium">Table</p>
      <p className="text-(--gray-page)">
        Configure the table and add text to cells.
      </p>

      <TableBoard liveState={liveState} editable onCellChange={setCellValue} />

      <div className="border-(--gray) border-b py-2 w-full flex flex-col gap-2">
        <button
          className="text-base font-medium flex items-center justify-start gap-2 w-full"
          onClick={() => setConfiguring((prev) => !prev)}
        >
          Configure table
          <ChevronRight size={18} className={`${configuring && "rotate-90"}`} />
        </button>
        {configuring && (
          <>
            <input
              type="number"
              min={1}
              max={20}
              className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
              value={columns}
              onChange={(event) => setColumns(event.target.value)}
              placeholder="Columns"
            />
            <input
              type="number"
              min={1}
              max={20}
              className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
              value={rows}
              onChange={(event) => setRows(event.target.value)}
              placeholder="Rows"
            />
            <button
              className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
              onClick={configureTable}
            >
              Save table
            </button>
          </>
        )}

        <div className="w-full h-px bg-(--gray)" />

        <button
          className="text-base font-medium flex items-center justify-start gap-2 w-full"
          onClick={() => setAdding((prev) => !prev)}
        >
          Add item
          <ChevronRight size={18} className={`${adding && "rotate-90"}`} />
        </button>
        {adding && (
          <>
            <input
              type="number"
              min={1}
              max={liveState.columns}
              className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
              value={newColumn}
              onChange={(event) => setNewColumn(event.target.value)}
              placeholder="Column"
            />
            <input
              type="number"
              min={1}
              max={liveState.rows}
              className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
              value={newRow}
              onChange={(event) => setNewRow(event.target.value)}
              placeholder="Row"
            />
            <input
              type="text"
              className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
              value={newValue}
              maxLength={MAX_FORM_TEXT_ANSWER_LENGTH}
              onChange={(event) => setNewValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addItem();
              }}
              placeholder="Input"
            />
            <button
              className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
              onClick={addItem}
            >
              Add item
            </button>
          </>
        )}
      </div>

      {liveState.cells.length > 0 ? (
        liveState.cells.map((cell, index) => (
          <div
            key={cell.id}
            className={`w-full min-w-0 flex items-center border-(--gray) border-dashed justify-between gap-2 ${index !== 0 ? "border-t pt-2" : null}`}
          >
            <span className="min-w-0 wrap-break-word">
              ({cell.column}, {cell.row}), {cell.value}
            </span>
            <button
              type="button"
              className="h-6.5 flex shrink-0 items-center justify-center aspect-square rounded-md hover:bg-(--darkest-hover) bg-(--dim) border-(--gray-page) border"
              onClick={() => deleteCell(cell.id)}
            >
              <Trash size={16} />
            </button>
          </div>
        ))
      ) : (
        <span className="text-(--gray-page)">No table values yet.</span>
      )}
    </>
  );
};
