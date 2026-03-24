import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

export interface ChatResponse {
  message?: string;
  sql?: string;
  columns?: string[];
  rows?: (string | number | null)[][];
  chart?: {
    type?: string;
    data?: Record<string, unknown>[];
    layout?: Record<string, unknown>;
    x?: string;
    y?: string;
    labels?: string[];
    values?: (string | number)[];
  };
  row_count?: number;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  response?: ChatResponse;
}

export async function sendMessage(question: string): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>("/chat", { question });
  return data;
}
