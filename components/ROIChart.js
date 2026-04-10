"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);

export default function ROIChart({ cost, annualSavings, years = 15, baselineCost, simulationNetBill }) {
  const labels = Array.from({ length: years + 1 }, (_, i) => `Y${i}`);

  const effectiveSavings =
    baselineCost != null && simulationNetBill != null
      ? baselineCost - simulationNetBill
      : annualSavings;

  const savingsData = labels.map((_, i) => i * effectiveSavings);
  const costLine = labels.map(() => cost);
  const breakEvenYear = effectiveSavings > 0 ? Math.ceil(cost / effectiveSavings) : null;

  const data = {
    labels,
    datasets: [
      {
        label: "Cumulative Savings",
        data: savingsData,
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79,70,229,0.08)",
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: "#4F46E5",
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: "System Cost",
        data: costLine,
        borderColor: "rgba(100,116,139,0.5)",
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderDash: [5, 4],
        fill: false,
        tension: 0,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#475569",
          font: { family: "Inter, DM Sans", size: 11 },
          boxWidth: 10,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E2E8F0",
        borderWidth: 1,
        titleColor: "#475569",
        bodyColor: "#0F172A",
        titleFont: { family: "JetBrains Mono", size: 11 },
        bodyFont: { family: "Inter, DM Sans", size: 12 },
        padding: 10,
        callbacks: {
          label: (ctx) => ` $${Math.round(ctx.parsed.y).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(226,232,240,0.8)" },
        ticks: { color: "#94A3B8", font: { family: "JetBrains Mono", size: 10 } },
      },
      y: {
        grid: { color: "rgba(226,232,240,0.8)" },
        ticks: {
          color: "#94A3B8",
          font: { family: "JetBrains Mono", size: 10 },
          callback: (v) => `$${(v / 1000).toFixed(0)}k`,
        },
      },
    },
  };

  return (
    <div>
      <Line data={data} options={options} />
      {breakEvenYear && breakEvenYear <= years && (
        <p
          className="text-center mt-3 text-xs"
          style={{ color: "var(--text-dim)", fontFamily: "JetBrains Mono, monospace" }}
        >
          Break-even at Year {breakEvenYear}
          {baselineCost != null && simulationNetBill != null && " · simulation-verified"}
        </p>
      )}
    </div>
  );
}
