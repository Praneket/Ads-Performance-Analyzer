import { useState } from "react";
import axios from "axios";
import FileUpload from "./components/FileUpload";
import StatCard from "./components/StatCard";
import { CampaignBarChart, MultiLineChart } from "./components/Charts";
import Insights from "./components/Insights";
import CampaignTable from "./components/CampaignTable";
import { downloadPDF } from "./components/pdfExport";

const API = "http://localhost:5000/api";

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");

  async function handleUpload(file) {
    setLoading(true);
    setError("");
    setData(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await axios.post(`${API}/analyze`, form);
      setData(res.data);
      setTab("overview");
    } catch (e) {
      setError(e.response?.data?.error || "Failed to analyze file. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setData(null);
    setError("");
  }

  const tabs = ["overview", "charts", "campaigns", "insights"];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">G</div>
            <span className="font-semibold text-white text-lg">Ads Performance Analyzer</span>
          </div>
          {data && (
            <div className="flex gap-2">
              <button
                onClick={() => downloadPDF(data)}
                className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
              >
                ⬇ Export PDF
              </button>
              <button
                onClick={reset}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                New Upload
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {!data ? (
          <div className="max-w-2xl mx-auto mt-16">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-white mb-3">Analyze Your Google Ads</h1>
              <p className="text-gray-400">Upload a CSV export from Google Ads to get instant performance insights.</p>
            </div>
            <FileUpload onUpload={handleUpload} loading={loading} />
            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-600/40 rounded-lg text-red-400 text-sm">
                ⚠ {error}
              </div>
            )}
            <div className="mt-8 p-4 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-500">
              <p className="font-medium text-gray-400 mb-2">Expected CSV columns:</p>
              <code className="text-blue-400">Campaign Name, Clicks, Impressions, Cost, Conversions, Revenue</code>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-xl w-fit">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    tab === t ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "overview" && <OverviewTab data={data} />}
            {tab === "charts" && <ChartsTab data={data} />}
            {tab === "campaigns" && <CampaignTable campaigns={data.campaigns} />}
            {tab === "insights" && <Insights insights={data.insights} />}
          </>
        )}
      </main>
    </div>
  );
}

function OverviewTab({ data }) {
  const { totals, top, bottom } = data;
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Clicks" value={totals.clicks.toLocaleString()} color="blue" icon="🖱️" />
        <StatCard label="Impressions" value={totals.impressions.toLocaleString()} color="purple" icon="👁️" />
        <StatCard label="Total Cost" value={`$${totals.cost.toLocaleString()}`} color="rose" icon="💰" />
        <StatCard label="Conversions" value={totals.conversions.toLocaleString()} color="green" icon="🎯" />
        <StatCard label="Avg CTR" value={`${totals.ctr}%`} color="cyan" icon="📈" />
        <StatCard label="Overall ROI" value={`${totals.roi}%`} color="orange" icon="📊" />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Avg CPC" value={`$${totals.cpc}`} sub="Cost per click" color="purple" />
        <StatCard label="Conv. Rate" value={`${totals.convRate}%`} sub="Conversions / Clicks" color="green" />
        <StatCard label="Total Revenue" value={`$${totals.revenue.toLocaleString()}`} sub="From conversions" color="orange" />
      </div>

      {/* Top / Bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RankCard title="🏆 Top Performers" campaigns={top} metric="roi" metricLabel="ROI" positive />
        <RankCard title="⚠️ Needs Attention" campaigns={bottom} metric="roi" metricLabel="ROI" />
      </div>
    </div>
  );
}

function RankCard({ title, campaigns, metric, metricLabel, positive }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="font-semibold text-white mb-4">{title}</h3>
      <ul className="space-y-3">
        {campaigns.map((c, i) => (
          <li key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-6 h-6 rounded-full bg-gray-800 text-gray-400 text-xs flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-gray-200 text-sm truncate">{c.campaign}</span>
            </div>
            <span className={`text-sm font-semibold ml-4 flex-shrink-0 ${positive ? "text-green-400" : c[metric] < 0 ? "text-red-400" : "text-yellow-400"}`}>
              {metricLabel}: {c[metric]}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartsTab({ data }) {
  const { campaigns } = data;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Clicks by Campaign">
        <CampaignBarChart data={campaigns} dataKey="clicks" color="#3b82f6" label="Clicks" />
      </ChartCard>
      <ChartCard title="Cost by Campaign ($)">
        <CampaignBarChart data={campaigns} dataKey="cost" color="#f59e0b" label="Cost ($)" />
      </ChartCard>
      <ChartCard title="Conversions by Campaign">
        <CampaignBarChart data={campaigns} dataKey="conversions" color="#10b981" label="Conversions" />
      </ChartCard>
      <ChartCard title="CTR / Conv Rate / ROI (%)">
        <MultiLineChart data={campaigns} />
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}
