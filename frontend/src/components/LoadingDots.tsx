export default function LoadingDots() {
  return (
    <div className="flex gap-3 bg-chat-bot px-4 py-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex items-center gap-1.5 pt-2">
        <span className="loading-dot h-2 w-2 rounded-full bg-primary" />
        <span className="loading-dot h-2 w-2 rounded-full bg-primary" />
        <span className="loading-dot h-2 w-2 rounded-full bg-primary" />
      </div>
    </div>
  );
}
