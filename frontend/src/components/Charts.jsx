import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const TOOLTIP_STYLE = {
  backgroundColor: "#1f2937",
  border: "1px solid #374151",
  borderRadius: "8px",
  color: "#f9fafb",
};

function truncate(str, n = 14) {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

export function CampaignBarChart({ data, dataKey, color, label }) {
  const chartData = data.map((c) => ({ name: truncate(c.campaign), value: c[dataKey] }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} angle={-30} textAnchor="end" />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [v, label]} />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MultiLineChart({ data }) {
  const chartData = data.map((c) => ({
    name: truncate(c.campaign),
    CTR: c.ctr,
    "Conv Rate": c.convRate,
    ROI: c.roi,
  }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} angle={-30} textAnchor="end" />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ color: "#9ca3af", paddingTop: "8px" }} />
        <Line type="monotone" dataKey="CTR" stroke="#3b82f6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Conv Rate" stroke="#10b981" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="ROI" stroke="#f59e0b" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
