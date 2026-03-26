import { useState } from "react";

const COLS = [
  { key: "campaign", label: "Campaign" },
  { key: "clicks", label: "Clicks" },
  { key: "impressions", label: "Impressions" },
  { key: "cost", label: "Cost ($)" },
  { key: "conversions", label: "Conv." },
  { key: "ctr", label: "CTR (%)" },
  { key: "cpc", label: "CPC ($)" },
  { key: "convRate", label: "Conv Rate (%)" },
  { key: "roi", label: "ROI (%)" },
];

export default function CampaignTable({ campaigns }) {
  const [sort, setSort] = useState({ key: "clicks", dir: "desc" });
  const [filter, setFilter] = useState("");

  const sorted = [...campaigns]
    .filter((c) => c.campaign.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      const v = sort.dir === "asc" ? 1 : -1;
      return typeof a[sort.key] === "string"
        ? a[sort.key].localeCompare(b[sort.key]) * v
        : (a[sort.key] - b[sort.key]) * v;
    });

  const toggle = (key) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  const roiColor = (v) =>
    v > 50 ? "text-green-400" : v > 0 ? "text-yellow-400" : "text-red-400";

  return (
    <div>
      <input
        type="text"
        placeholder="Filter campaigns..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4 w-full sm:w-72 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/80">
            <tr>
              {COLS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggle(col.key)}
                  className="px-4 py-3 text-left text-gray-400 font-medium cursor-pointer hover:text-white select-none whitespace-nowrap"
                >
                  {col.label}
                  {sort.key === col.key ? (sort.dir === "asc" ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => (
              <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
                <td className="px-4 py-3 font-medium text-white max-w-[180px] truncate">{c.campaign}</td>
                <td className="px-4 py-3 text-gray-300">{c.clicks.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-300">{c.impressions.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-300">${c.cost.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-300">{c.conversions}</td>
                <td className="px-4 py-3 text-blue-400">{c.ctr}%</td>
                <td className="px-4 py-3 text-purple-400">${c.cpc}</td>
                <td className="px-4 py-3 text-cyan-400">{c.convRate}%</td>
                <td className={`px-4 py-3 font-semibold ${roiColor(c.roi)}`}>{c.roi}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!sorted.length && (
          <p className="text-center text-gray-500 py-8">No campaigns match your filter.</p>
        )}
      </div>
    </div>
  );
}
