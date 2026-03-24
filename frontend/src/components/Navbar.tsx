import { useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/": "Chat",
  "/dashboard": "Dashboard",
  "/history": "History",
};

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-base font-semibold text-foreground">
        {titles[pathname] ?? "Chat"}
      </h1>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          U
        </div>
      </div>
    </header>
  );
}
