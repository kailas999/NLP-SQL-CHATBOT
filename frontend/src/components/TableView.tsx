interface Props {
  columns: string[];
  rows: (string | number | null)[][];
  rowCount?: number;
}

export default function TableView({ columns, rows, rowCount }: Props) {
  return (
    <div className="mt-3">
      <div className="scrollbar-thin overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary">
              {columns.map((col, i) => (
                <th key={i} className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 100).map((row, ri) => (
              <tr key={ri} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className="whitespace-nowrap px-4 py-2 text-foreground">
                    {cell ?? <span className="text-muted-foreground italic">null</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rowCount != null && (
        <p className="mt-2 text-xs text-muted-foreground">
          {rowCount} row{rowCount !== 1 ? "s" : ""} returned
          {rows.length > 100 && " (showing first 100)"}
        </p>
      )}
    </div>
  );
}
