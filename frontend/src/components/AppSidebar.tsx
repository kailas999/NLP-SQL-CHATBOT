import { useLocation, Link } from "react-router-dom";
import { HiOutlineChatBubbleLeftRight, HiOutlineChartBarSquare, HiOutlineClock } from "react-icons/hi2";
import { RiGovernmentLine } from "react-icons/ri";

const navItems = [
  { title: "Chat", path: "/", icon: HiOutlineChatBubbleLeftRight },
  { title: "Dashboard", path: "/dashboard", icon: HiOutlineChartBarSquare },
  { title: "History", path: "/history", icon: HiOutlineClock },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AppSidebar({ collapsed, onToggle }: Props) {
  const { pathname } = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 z-30 flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <RiGovernmentLine className="h-6 w-6 shrink-0 text-primary" />
        {!collapsed && (
          <span className="truncate text-sm font-semibold text-sidebar-accent-foreground">
            NLP TO SQL
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="mt-4 flex flex-1 flex-col gap-1 px-2">
        {navItems.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="m-2 flex items-center justify-center rounded-md py-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <svg
          className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  );
}
