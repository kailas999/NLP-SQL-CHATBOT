import { useMemo } from "react";
import { HiOutlineChatBubbleLeftRight, HiOutlineClock, HiOutlineTableCells } from "react-icons/hi2";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const mockChartData = [
  { name: "Mon", queries: 12 },
  { name: "Tue", queries: 19 },
  { name: "Wed", queries: 8 },
  { name: "Thu", queries: 25 },
  { name: "Fri", queries: 15 },
  { name: "Sat", queries: 6 },
  { name: "Sun", queries: 10 },
];

const mockAreaData = [
  { name: "Week 1", avg: 2.1 },
  { name: "Week 2", avg: 1.8 },
  { name: "Week 3", avg: 2.5 },
  { name: "Week 4", avg: 1.4 },
];

export default function Dashboard() {
  const history = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("nl2sql_history") || "[]");
    } catch {
      return [];
    }
  }, []);

  const totalQueries = history.length;
  const lastQuery = history[0]?.question || "No queries yet";
  const lastTime = history[0]?.timestamp
    ? new Date(history[0].timestamp).toLocaleString()
    : "—";

  const stats = [
    { label: "Total Queries", value: totalQueries, icon: HiOutlineChatBubbleLeftRight },
    { label: "Last Query", value: lastQuery, icon: HiOutlineClock, truncate: true },
    { label: "Last Query Time", value: lastTime, icon: HiOutlineTableCells },
  ];

  return (
    <div className="scrollbar-thin h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <s.icon className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">{s.label}</span>
              </div>
              <p className={`text-lg font-semibold text-foreground ${s.truncate ? "truncate" : ""}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Queries Per Day</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,12%,20%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(215,14%,55%)", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(215,14%,55%)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "hsl(220,14%,14%)", border: "1px solid hsl(220,12%,20%)", borderRadius: 8, color: "#c8ccd4" }}
                />
                <Bar dataKey="queries" fill="hsl(174,62%,47%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Avg Response Time (s)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={mockAreaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,12%,20%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(215,14%,55%)", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(215,14%,55%)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "hsl(220,14%,14%)", border: "1px solid hsl(220,12%,20%)", borderRadius: 8, color: "#c8ccd4" }}
                />
                <Area type="monotone" dataKey="avg" stroke="hsl(174,62%,47%)" fill="hsl(174,62%,47%)" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
