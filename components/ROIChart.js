"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

export default function ROIChart({ cost, annualSavings, years = 15 }) {
  const labels = Array.from({ length: years + 1 }, (_, i) => `Y${i}`);

  const savingsData = labels.map((_, i) => i * annualSavings);
  const costLine = labels.map(() => cost);

  const breakEvenYear = Math.ceil(cost / annualSavings);

  const data = {
    labels,
    datasets: [
      {
        label: "Cumulative Savings",
        data: savingsData,
        borderColor: "#C8FF00",
        backgroundColor: "rgba(200,255,0,0.08)",
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: "#C8FF00",
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: "System Cost",
        data: costLine,
        borderColor: "rgba(255,100,100,0.6)",
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderDash: [6, 4],
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
          color: "#9CA3AF",
          font: { family: "JetBrains Mono", size: 11 },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: "#111827",
        borderColor: "rgba(200,255,0,0.3)",
        borderWidth: 1,
        titleColor: "#C8FF00",
        bodyColor: "#D1D5DB",
        titleFont: { family: "JetBrains Mono", size: 11 },
        bodyFont: { family: "DM Sans", size: 12 },
        callbacks: {
          label: (ctx) =>
            ` $${Math.round(ctx.parsed.y).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(200,255,0,0.04)" },
        ticks: {
          color: "#6B7280",
          font: { family: "JetBrains Mono", size: 10 },
        },
      },
      y: {
        grid: { color: "rgba(200,255,0,0.04)" },
        ticks: {
          color: "#6B7280",
          font: { family: "JetBrains Mono", size: 10 },
          callback: (v) => `$${(v / 1000).toFixed(0)}k`,
        },
      },
    },
  };

  return (
    <div>
      <Line data={data} options={options} />
      {breakEvenYear <= years && (
        <p
          className="text-center mt-3 text-xs"
          style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(200,255,0,0.6)" }}
        >
          Break-even at Year {breakEvenYear}
        </p>
      )}
    </div>
  );
}
