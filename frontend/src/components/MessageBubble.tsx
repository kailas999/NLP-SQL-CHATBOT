import type { ChatMessage } from "@/services/api";
import SqlBlock from "./SqlBlock";
import TableView from "./TableView";
import ChartView from "./ChartView";
import { HiOutlineUser, HiOutlineCpuChip } from "react-icons/hi2";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const resp = message.response;

  return (
    <div className={`animate-fade-in-up flex gap-3 px-4 py-4 ${isUser ? "bg-chat-user" : "bg-chat-bot"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
        }`}
      >
        {isUser ? <HiOutlineUser className="h-4 w-4" /> : <HiOutlineCpuChip className="h-4 w-4" />}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm leading-relaxed text-foreground">{message.content}</p>

        {resp && (
          <div className="space-y-2">
            {resp.sql && <SqlBlock sql={resp.sql} />}
            {resp.columns && resp.rows && (
              <TableView columns={resp.columns} rows={resp.rows} rowCount={resp.row_count} />
            )}
            {resp.chart && <ChartView chart={resp.chart} />}
            {resp.error && (
              <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {resp.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
