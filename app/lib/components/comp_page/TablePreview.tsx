const TABLE_VALUES = [
  { column: 2, row: 1, value: "svelte", color: "red-bg" },
  { column: 3, row: 1, value: "nextjs", color: "purple-bg" },
  { column: 1, row: 2, value: "pros", color: "cyan-bg" },
  { column: 1, row: 3, value: "cons", color: "cyan-bg" },
  { column: 2, row: 2, value: "intuitive and easy to learn and use" },
  {
    column: 2,
    row: 3,
    value: "svelte 5 is quite new, so support might not be as wide",
  },
  {
    column: 3,
    row: 2,
    value: 'a lot of support, familiar for js/ts people, more "possibilities"',
  },
  {
    column: 3,
    row: 3,
    value: "more complicated syntax, might feel overwhelming",
  },
];

function getCell(row: number, column: number) {
  return TABLE_VALUES.find(
    (cell) => cell.row === row && cell.column === column,
  );
}

export const TablePreview = () => {
  return (
    <div className="w-full max-w-full min-w-0 overflow-x-auto border rounded-md border-(--gray)">
      <div className="min-w-225 flex flex-col">
        {Array.from({ length: 3 }).map((_, rowIndex) => {
          const row = rowIndex + 1;

          return (
            <div
              key={row}
              className={`w-full ${rowIndex !== 2 && "border-b"} border-(--gray) text-left grid justify-between items-start ${rowIndex % 2 !== 0 && "bg-(--gray)/10"}`}
              style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
            >
              {Array.from({ length: 3 }).map((_, columnIndex) => {
                const column = columnIndex + 1;
                const cell = getCell(row, column);

                return (
                  <div
                    key={column}
                    className="p-2 border-r border-(--gray) last:border-r-0 min-h-10 h-full flex flex-col items-start justify-start gap-2 text-wrap"
                    style={{
                      backgroundColor: cell?.color
                        ? `color-mix(in srgb, var(--${cell.color}) 40%, transparent)`
                        : undefined,
                    }}
                  >
                    <span className="min-w-0 wrap-break-word">
                      {cell?.value ?? ""}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
