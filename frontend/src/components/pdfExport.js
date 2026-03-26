import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function downloadPDF(data) {
  const { campaigns, totals, insights } = data;
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  doc.text("Google Ads Performance Report", 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Summary", 14, 36);

  autoTable(doc, {
    startY: 40,
    head: [["Metric", "Value"]],
    body: [
      ["Total Clicks", totals.clicks.toLocaleString()],
      ["Total Impressions", totals.impressions.toLocaleString()],
      ["Total Cost", `$${totals.cost.toLocaleString()}`],
      ["Total Conversions", totals.conversions],
      ["Overall CTR", `${totals.ctr}%`],
      ["Overall CPC", `$${totals.cpc}`],
      ["Overall Conv. Rate", `${totals.convRate}%`],
      ["Overall ROI", `${totals.roi}%`],
    ],
    theme: "striped",
    headStyles: { fillColor: [30, 64, 175] },
    margin: { left: 14 },
    tableWidth: 100,
  });

  const afterSummary = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text("Campaign Details", 14, afterSummary);

  autoTable(doc, {
    startY: afterSummary + 4,
    head: [["Campaign", "Clicks", "Impressions", "Cost ($)", "Conv.", "CTR (%)", "CPC ($)", "Conv Rate (%)", "ROI (%)"]],
    body: campaigns.map((c) => [
      c.campaign, c.clicks, c.impressions, c.cost, c.conversions,
      c.ctr, c.cpc, c.convRate, c.roi,
    ]),
    theme: "striped",
    headStyles: { fillColor: [30, 64, 175] },
    styles: { fontSize: 8 },
  });

  if (insights.length) {
    const afterTable = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text("Insights & Recommendations", 14, afterTable);
    autoTable(doc, {
      startY: afterTable + 4,
      head: [["Type", "Insight"]],
      body: insights.map((ins) => [ins.type.toUpperCase(), ins.message]),
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
      styles: { fontSize: 8, cellWidth: "wrap" },
      columnStyles: { 1: { cellWidth: 220 } },
    });
  }

  doc.save("google-ads-report.pdf");
}
