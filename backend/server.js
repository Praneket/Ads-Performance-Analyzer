const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { parse } = require("csv-parse/sync");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

function parseNumber(val) {
  if (val === undefined || val === null || val === "") return 0;
  return parseFloat(String(val).replace(/[^0-9.-]/g, "")) || 0;
}

function calcMetrics(row) {
  const clicks = parseNumber(row["Clicks"]);
  const impressions = parseNumber(row["Impressions"]);
  const cost = parseNumber(row["Cost"]);
  const conversions = parseNumber(row["Conversions"]);
  const revenue = parseNumber(row["Revenue"]);

  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc = clicks > 0 ? cost / clicks : 0;
  const convRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
  const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;

  return {
    campaign: row["Campaign Name"] || row["Campaign"] || "Unknown",
    clicks,
    impressions,
    cost: parseFloat(cost.toFixed(2)),
    conversions,
    revenue: parseFloat(revenue.toFixed(2)),
    ctr: parseFloat(ctr.toFixed(2)),
    cpc: parseFloat(cpc.toFixed(2)),
    convRate: parseFloat(convRate.toFixed(2)),
    roi: parseFloat(roi.toFixed(2)),
  };
}

function generateInsights(campaigns) {
  const insights = [];

  campaigns.forEach((c) => {
    if (c.impressions > 5000 && c.ctr < 1) {
      insights.push({
        campaign: c.campaign,
        type: "warning",
        message: `"${c.campaign}" has high impressions (${c.impressions.toLocaleString()}) but low CTR (${c.ctr}%) — consider improving ad creatives.`,
      });
    }
    if (c.cpc > 5) {
      insights.push({
        campaign: c.campaign,
        type: "warning",
        message: `"${c.campaign}" has a high CPC ($${c.cpc}) — optimize your bidding strategy or refine targeting.`,
      });
    }
    if (c.convRate > 5) {
      insights.push({
        campaign: c.campaign,
        type: "success",
        message: `"${c.campaign}" has an excellent conversion rate (${c.convRate}%) — consider increasing budget.`,
      });
    }
    if (c.roi < 0) {
      insights.push({
        campaign: c.campaign,
        type: "danger",
        message: `"${c.campaign}" has negative ROI (${c.roi}%) — review cost structure and targeting immediately.`,
      });
    }
    if (c.clicks === 0 && c.impressions > 0) {
      insights.push({
        campaign: c.campaign,
        type: "warning",
        message: `"${c.campaign}" has impressions but zero clicks — ad copy may not be compelling enough.`,
      });
    }
    if (c.roi > 100) {
      insights.push({
        campaign: c.campaign,
        type: "success",
        message: `"${c.campaign}" is delivering strong ROI (${c.roi}%) — a top performer worth scaling.`,
      });
    }
  });

  return insights;
}

app.post("/api/analyze", upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });

    const content = req.file.buffer.toString("utf-8");
    let records;

    try {
      records = parse(content, { columns: true, skip_empty_lines: true, trim: true });
    } catch {
      return res.status(400).json({ error: "Invalid CSV format. Please check your file." });
    }

    if (!records.length) return res.status(400).json({ error: "CSV file is empty." });

    const requiredCols = ["Clicks", "Impressions", "Cost"];
    const headers = Object.keys(records[0]);
    const missing = requiredCols.filter(
      (col) => !headers.some((h) => h.toLowerCase() === col.toLowerCase())
    );
    if (missing.length) {
      return res.status(400).json({ error: `Missing required columns: ${missing.join(", ")}` });
    }

    const campaigns = records.map(calcMetrics);

    const totals = campaigns.reduce(
      (acc, c) => ({
        clicks: acc.clicks + c.clicks,
        impressions: acc.impressions + c.impressions,
        cost: parseFloat((acc.cost + c.cost).toFixed(2)),
        conversions: acc.conversions + c.conversions,
        revenue: parseFloat((acc.revenue + c.revenue).toFixed(2)),
      }),
      { clicks: 0, impressions: 0, cost: 0, conversions: 0, revenue: 0 }
    );

    totals.ctr = totals.impressions > 0 ? parseFloat(((totals.clicks / totals.impressions) * 100).toFixed(2)) : 0;
    totals.cpc = totals.clicks > 0 ? parseFloat((totals.cost / totals.clicks).toFixed(2)) : 0;
    totals.convRate = totals.clicks > 0 ? parseFloat(((totals.conversions / totals.clicks) * 100).toFixed(2)) : 0;
    totals.roi = totals.cost > 0 ? parseFloat((((totals.revenue - totals.cost) / totals.cost) * 100).toFixed(2)) : 0;

    const sorted = [...campaigns].sort((a, b) => b.roi - a.roi);
    const top = sorted.slice(0, 3);
    const bottom = sorted.slice(-3).reverse();

    const insights = generateInsights(campaigns);

    res.json({ campaigns, totals, top, bottom, insights });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
