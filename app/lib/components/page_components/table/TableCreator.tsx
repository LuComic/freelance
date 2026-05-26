"use client";

import { useState } from "react";
import { ChevronRight, Trash } from "lucide-react";
import type { PageComponentLiveStateByType } from "@/lib/pageDocument";
import { MAX_FORM_TEXT_ANSWER_LENGTH } from "@/lib/inputLimits";
import { TableBoard } from "./TableBoard";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TableState = PageComponentLiveStateByType<"Table">["state"];
type TableCellColor = NonNullable<TableState["cells"][number]["color"]>;

const TABLE_CELL_COLORS: Array<{ value: TableCellColor; label: string }> = [
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "yellow", label: "Yellow" },
  { value: "pink", label: "Pink" },
  { value: "purple", label: "Purple" },
  { value: "cyan", label: "Cyan" },
];

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
  const [newRow, setNewRow] = useState("");
  const [newColumn, setNewColumn] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newColor, setNewColor] = useState<TableCellColor | undefined>();

  const setCellValue = (
    column: number,
    row: number,
    value: string,
    color?: TableCellColor,
  ) => {
    onChangeLiveState((currentState) => {
      const nextValue = value.slice(0, MAX_FORM_TEXT_ANSWER_LENGTH);
      const existing = currentState.cells.find(
        (cell) => cell.column === column && cell.row === row,
      );

      if (existing) {
        return {
          ...currentState,
          cells: currentState.cells.map((cell) =>
            cell.id === existing.id
              ? { ...cell, value: nextValue, color: color ?? cell.color }
              : cell,
          ),
        };
      }

      if (nextValue.trim() === "") return currentState;

      return {
        ...currentState,
        cells: [
          ...currentState.cells,
          { id: crypto.randomUUID(), row, column, value: nextValue, color },
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
    const rowValue = Number(newRow);
    const columnValue = Number(newColumn);

    if (
      newRow.trim() === "" ||
      newColumn.trim() === "" ||
      !Number.isFinite(rowValue) ||
      !Number.isFinite(columnValue) ||
      rowValue < 1 ||
      columnValue < 1 ||
      newValue.trim() === ""
    )
      return;

    const row = clampCount(rowValue);
    const column = clampCount(columnValue);
    if (row > liveState.rows || column > liveState.columns) return;

    setCellValue(column, row, newValue, newColor);
    setNewValue("");
  };

  const deleteCell = (column: number, row: number) => {
    onChangeLiveState((currentState) => ({
      ...currentState,
      cells: currentState.cells.filter(
        (cell) => cell.column !== column || cell.row !== row,
      ),
    }));
  };

  return (
    <>
      <p className="text-lg font-medium">Table</p>
      <p className="text-(--gray-page)">
        Configure the table and add text to cells.
      </p>

      <TableBoard
        liveState={liveState}
        editable
        onCellChange={setCellValue}
        onCellDelete={deleteCell}
      />

      <div className="border-(--gray) border-b py-2 w-full flex flex-col gap-2">
        <button
          className="text-base font-medium flex items-center justify-start gap-2 w-full text-left"
          onClick={() => setConfiguring((prev) => !prev)}
        >
          Configure table
          <ChevronRight size={18} className={`${configuring && "rotate-90"}`} />
        </button>
        {configuring && (
          <>
            <p className="text-(--gray-page)">Column count</p>
            <input
              type="number"
              min={1}
              max={20}
              className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
              value={columns}
              onChange={(event) => setColumns(event.target.value)}
              placeholder="Columns"
            />
            <p className="text-(--gray-page)">Row count</p>
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
          className="text-base font-medium flex items-center justify-start gap-2 w-full text-left"
          onClick={() => setAdding((prev) => !prev)}
        >
          Add item
          <ChevronRight size={18} className={`${adding && "rotate-90"}`} />
        </button>
        {adding && (
          <>
            <p className="text-(--gray-page)">Column, row</p>
            <div className="flex items-center justify-between w-full gap-2">
              <input
                type="number"
                min={1}
                max={liveState.columns}
                className="rounded-md bg-(--dim) px-2 py-1.5 outline-none w-full"
                value={newColumn}
                onChange={(event) => setNewColumn(event.target.value)}
                placeholder="Column"
              />
              <input
                type="number"
                min={1}
                max={liveState.rows}
                className="rounded-md bg-(--dim) px-2 py-1.5 outline-none w-full"
                value={newRow}
                onChange={(event) => setNewRow(event.target.value)}
                placeholder="Row"
              />
            </div>
            <input
              type="text"
              className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
              value={newValue}
              maxLength={MAX_FORM_TEXT_ANSWER_LENGTH}
              onChange={(event) => setNewValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addItem();
              }}
              placeholder="Table field value"
            />
            <Select
              value={newColor}
              onValueChange={(value) => setNewColor(value as TableCellColor)}
            >
              <SelectTrigger className="w-full bg-(--dim) border-(--gray-page)">
                <SelectValue placeholder="Select a color (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-(--quite-dark) border-none text-(--gray-page)">
                <SelectGroup className="bg-(--quite-dark)">
                  {TABLE_CELL_COLORS.map((color) => (
                    <SelectItem
                      key={color.value}
                      value={color.value}
                      className="data-highlighted:bg-(--quite-dark-hover) data-highlighted:text-(--light)"
                    >
                      {color.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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
              onClick={() => deleteCell(cell.column, cell.row)}
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
