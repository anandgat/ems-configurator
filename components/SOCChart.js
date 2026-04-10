"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const CHECKPOINTS = [
  { key: "socAt6AM",  label: "6 AM (After Overnight Charge)" },
  { key: "socAt9AM",  label: "9 AM (After Morning Peak)" },
  { key: "socAt4PM",  label: "4 PM (After Daytime Recharge)" },
  { key: "socAt7PM",  label: "7 PM (After Afternoon Peak)" },
  { key: "socAt10PM", label: "10 PM (After Ultra-Peak)" },
];

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];

export default function SOCChart({ months, batteryCapacity }) {
  if (!months || months.length === 0) return null;

  const labels = months.map((m) => m.monthName.substring(0, 3));

  const datasets = CHECKPOINTS.map((cp, i) => ({
    label: cp.label,
    data: months.map((m) => m[cp.key]),
    borderColor: COLORS[i],
    backgroundColor: "transparent",
    borderWidth: 2,
    tension: 0.3,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: COLORS[i],
  }));

  if (batteryCapacity) {
    const minSOC = batteryCapacity * 0.2;
    datasets.push({
      label: `Min SOC (${minSOC.toFixed(1)} kWh)`,
      data: labels.map(() => minSOC),
      borderColor: "rgba(100,116,139,0.4)",
      backgroundColor: "transparent",
      borderWidth: 1,
      borderDash: [5, 4],
      pointRadius: 0,
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#475569",
          font: { family: "Inter, DM Sans", size: 10 },
          boxWidth: 10,
          padding: 12,
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
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} kWh`,
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
          callback: (v) => `${v} kWh`,
        },
        title: {
          display: true,
          text: "State of Charge (kWh)",
          color: "#475569",
          font: { family: "Inter, DM Sans", size: 10 },
        },
      },
    },
  };

  return <Line data={{ labels, datasets }} options={options} />;
}
