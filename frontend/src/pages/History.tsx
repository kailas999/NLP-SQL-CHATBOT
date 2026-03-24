import { useState, useMemo } from "react";
import { HiOutlineClock, HiOutlineTrash } from "react-icons/hi2";
import SqlBlock from "@/components/SqlBlock";
import TableView from "@/components/TableView";
import ChartView from "@/components/ChartView";
import type { ChatResponse } from "@/services/api";

interface HistoryEntry {
  question: string;
  timestamp: string;
  response: ChatResponse;
}

export default function History() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("nl2sql_history") || "[]");
    } catch {
      return [];
    }
  });
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const selected = selectedIdx !== null ? history[selectedIdx] : null;

  const clearHistory = () => {
    localStorage.removeItem("nl2sql_history");
    setHistory([]);
    setSelectedIdx(null);
  };

  return (
    <div className="flex h-full">
      {/* List */}
      <div className="w-80 shrink-0 border-r border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Past Queries</span>
          {history.length > 0 && (
            <button onClick={clearHistory} className="text-muted-foreground transition-colors hover:text-destructive">
              <HiOutlineTrash className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="scrollbar-thin h-[calc(100%-49px)] overflow-y-auto">
          {history.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No history yet.</p>
          )}
          {history.map((entry, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={`w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-secondary/50 ${
                selectedIdx === i ? "bg-secondary" : ""
              }`}
            >
              <p className="truncate text-sm text-foreground">{entry.question}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <HiOutlineClock className="h-3 w-3" />
                {new Date(entry.timestamp).toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="scrollbar-thin flex-1 overflow-y-auto p-6">
        {!selected ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p className="text-sm">Select a query to view results</p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{selected.question}</h2>
            {selected.response.message && (
              <p className="text-sm text-secondary-foreground">{selected.response.message}</p>
            )}
            {selected.response.sql && <SqlBlock sql={selected.response.sql} />}
            {selected.response.columns && selected.response.rows && (
              <TableView
                columns={selected.response.columns}
                rows={selected.response.rows}
                rowCount={selected.response.row_count}
              />
            )}
            {selected.response.chart && <ChartView chart={selected.response.chart} />}
          </div>
        )}
      </div>
    </div>
  );
}
