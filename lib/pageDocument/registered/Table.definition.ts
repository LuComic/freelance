import { defineRegisteredPageComponentDefinition } from "../registeredDefinitions";
import { isRecord } from "../utils";
import { MAX_FORM_TEXT_ANSWER_LENGTH, truncateInput } from "../../inputLimits";

const MIN_TABLE_SIZE = 1;
const MAX_TABLE_SIZE = 20;

function normalizeCount(value: unknown, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(MAX_TABLE_SIZE, Math.max(MIN_TABLE_SIZE, Math.floor(value)));
}

export const TableDefinition = defineRegisteredPageComponentDefinition({
  type: "Table",
  commands: ["table"],
  createDefaultConfig: () => ({}),
  createDefaultState: () => ({
    rows: 3,
    columns: 3,
    cells: [] as Array<{
      id: string;
      row: number;
      column: number;
      value: string;
    }>,
  }),
  normalizeConfig: (value, fallback) => {
    if (typeof value === "object" && value !== null) {
      return value as typeof fallback;
    }

    return fallback;
  },
  normalizeState: (value, fallback) => {
    if (!isRecord(value)) return fallback;

    const rows = normalizeCount(value.rows, fallback.rows);
    const columns = normalizeCount(value.columns, fallback.columns);
    const cells = Array.isArray(value.cells) ? value.cells : [];

    return {
      rows,
      columns,
      cells: cells
        .map((cell, index) => {
          if (!isRecord(cell) || typeof cell.value !== "string") return null;

          const row = normalizeCount(cell.row, 1);
          const column = normalizeCount(cell.column, 1);

          if (row > rows || column > columns) return null;

          return {
            id:
              typeof cell.id === "string" && cell.id.trim().length > 0
                ? cell.id
                : `cell_${index + 1}`,
            row,
            column,
            value: truncateInput(cell.value, MAX_FORM_TEXT_ANSWER_LENGTH),
          };
        })
        .filter(
          (cell): cell is (typeof fallback.cells)[number] => cell !== null,
        ),
    };
  },
  componentLibrary: {
    name: "Table",
    description: "A configurable table for structured text. Command: /table",
    previewSrc: "/component-previews/table.svg",
    tag: "input",
    limited: false,
  },
});
