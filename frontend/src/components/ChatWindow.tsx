import { useState, useRef, useEffect } from "react";
import { HiOutlinePaperAirplane, HiOutlineTrash } from "react-icons/hi2";
import type { ChatMessage } from "@/services/api";
import { sendMessage } from "@/services/api";
import MessageBubble from "./MessageBubble";
import LoadingDots from "./LoadingDots";
import { toast } from "sonner";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

interface HistoryEntry {
  question: string;
  timestamp: string;
  response: ReturnType<typeof Object>;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: q,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendMessage(q);
      const botMsg: ChatMessage = {
        id: generateId(),
        role: "bot",
        content: data.message || "Here are the results:",
        timestamp: new Date(),
        response: data,
      };
      setMessages((prev) => [...prev, botMsg]);

      // Save to history
      const history: HistoryEntry[] = JSON.parse(localStorage.getItem("nl2sql_history") || "[]");
      history.unshift({ question: q, timestamp: new Date().toISOString(), response: data });
      localStorage.setItem("nl2sql_history", JSON.stringify(history.slice(0, 50)));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get response";
      toast.error(errorMessage);
      const errMsg: ChatMessage = {
        id: generateId(),
        role: "bot",
        content: "Sorry, something went wrong.",
        timestamp: new Date(),
        response: { error: errorMessage },
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <HiOutlinePaperAirplane className="h-10 w-10 rotate-[-30deg] opacity-30" />
            <p className="text-sm">Ask a question in natural language</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {loading && <LoadingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-4">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              title="Clear chat"
            >
              <HiOutlineTrash className="h-4 w-4" />
            </button>
          )}
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask about your data..."
              className="h-11 w-full rounded-lg border border-border bg-input px-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
            >
              <HiOutlinePaperAirplane className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
