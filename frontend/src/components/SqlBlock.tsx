import { useState } from "react";
import { HiOutlineClipboard, HiOutlineCheck } from "react-icons/hi2";

export default function SqlBlock({ sql }: { sql: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-3 rounded-lg border border-border bg-code-bg">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">SQL</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? <HiOutlineCheck className="h-3.5 w-3.5 text-success" /> : <HiOutlineClipboard className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="scrollbar-thin overflow-x-auto p-4 text-sm text-foreground">
        <code>{sql}</code>
      </pre>
    </div>
  );
}
