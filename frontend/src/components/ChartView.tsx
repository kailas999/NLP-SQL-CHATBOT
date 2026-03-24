import Plot from "react-plotly.js";
import type { ChatResponse } from "@/services/api";

interface Props {
  chart: NonNullable<ChatResponse["chart"]>;
}

export default function ChartView({ chart }: Props) {
  // If the backend sends full Plotly data+layout
  if (chart.data && Array.isArray(chart.data)) {
    return (
      <div className="mt-3 rounded-lg border border-border bg-code-bg p-2">
        <Plot
          data={chart.data as Plotly.Data[]}
          layout={{
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { color: "#c8ccd4", family: "Inter" },
            margin: { t: 30, r: 20, b: 40, l: 50 },
            ...(chart.layout as Partial<Plotly.Layout>),
          }}
          config={{ responsive: true, displayModeBar: false }}
          className="w-full"
          style={{ width: "100%", height: 320 }}
        />
      </div>
    );
  }

  // Simple bar chart fallback from labels/values
  if (chart.labels && chart.values) {
    return (
      <div className="mt-3 rounded-lg border border-border bg-code-bg p-2">
        <Plot
          data={[
            {
              x: chart.labels,
              y: chart.values,
              type: "bar",
              marker: { color: "hsl(174, 62%, 47%)" },
            },
          ]}
          layout={{
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { color: "#c8ccd4", family: "Inter" },
            margin: { t: 20, r: 20, b: 40, l: 50 },
          }}
          config={{ responsive: true, displayModeBar: false }}
          style={{ width: "100%", height: 320 }}
        />
      </div>
    );
  }

  return null;
}
