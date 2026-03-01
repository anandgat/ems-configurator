"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ROIChart from "@/components/ROIChart";

export default function Results() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [input, setInput] = useState(null);

  useEffect(() => {
    const r = sessionStorage.getItem("ems_result");
    const i = sessionStorage.getItem("ems_input");
    if (!r) {
      router.push("/");
      return;
    }
    setResult(JSON.parse(r));
    setInput(JSON.parse(i));
  }, [router]);

  if (!result) {
    return (
      <main className="content min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  const cfg = result.recommended_config;

  return (
    <main className="content min-h-screen">
      {/* Header */}
      <header className="border-b border-volt/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-volt transition-colors text-sm"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            ← Back to configurator
          </button>
          <span
            className="font-display font-800 text-lg tracking-tight"
            style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }}
          >
            EMS<span className="text-volt">configurator</span>
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Top banner */}
        <div className="slide-up mb-8">
          <p className="ems-label mb-3" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(200,255,0,0.7)" }}>
            AI Recommendation
          </p>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1
                className="text-4xl md:text-5xl font-800 leading-tight"
                style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }}
              >
                {cfg.name}
              </h1>
              <p className="text-gray-400 mt-2 text-lg max-w-2xl" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {result.reason}
              </p>
            </div>
            <div
              className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                background: result.roi_meets_target
                  ? "rgba(200,255,0,0.15)"
                  : "rgba(255,165,0,0.15)",
                border: result.roi_meets_target
                  ? "1px solid rgba(200,255,0,0.5)"
                  : "1px solid rgba(255,165,0,0.5)",
                color: result.roi_meets_target ? "#C8FF00" : "#FFA500",
              }}
            >
              {result.roi_meets_target ? "✓ ROI Target Met" : "⚠ ROI Partially Met"}
            </div>
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 slide-up slide-up-delay-1">
          {[
            {
              label: "System Cost",
              value: `$${cfg.cost_usd.toLocaleString()}`,
              sub: "upfront investment",
            },
            {
              label: "Annual Savings",
              value: `$${result.projected_annual_savings_usd.toLocaleString()}`,
              sub: "per year",
            },
            {
              label: "Payback Period",
              value: `${result.actual_payback_years} yrs`,
              sub: "break-even",
            },
            {
              label: "ROI Achieved",
              value: `${result.roi_achieved_pct}%`,
              sub: "return on investment",
            },
          ].map((stat) => (
            <div key={stat.label} className="stat-box">
              <p className="ems-label mb-1" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(200,255,0,0.6)" }}>
                {stat.label}
              </p>
              <p
                className="text-2xl font-800 text-volt"
                style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }}
              >
                {stat.value}
              </p>
              <p className="text-gray-500 text-xs mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Chart + Specs side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* ROI Chart */}
          <div className="ems-card rounded-2xl p-6 slide-up slide-up-delay-2">
            <p className="ems-label mb-4" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(200,255,0,0.7)" }}>
              Cumulative Savings Over Time
            </p>
            <ROIChart
              cost={cfg.cost_usd}
              annualSavings={result.projected_annual_savings_usd}
              years={15}
            />
          </div>

          {/* System Specs */}
          <div className="ems-card rounded-2xl p-6 slide-up slide-up-delay-2">
            <p className="ems-label mb-4" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(200,255,0,0.7)" }}>
              System Specifications
            </p>
            <div className="space-y-3">
              {[
                { label: "Capacity", value: `${cfg.capacity_kw} kW` },
                { label: "Storage", value: `${cfg.storage_kwh} kWh` },
                { label: "Efficiency", value: `${cfg.efficiency_pct}%` },
                { label: "Warranty", value: `${cfg.warranty_years} years` },
                { label: "Best For", value: cfg.best_for },
              ].map((spec) => (
                <div
                  key={spec.label}
                  className="flex justify-between items-start py-2 border-b border-volt/5"
                >
                  <span
                    className="text-gray-500 text-sm"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {spec.label}
                  </span>
                  <span
                    className="text-gray-200 text-sm text-right max-w-[55%]"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  >
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="ems-card rounded-2xl p-6 mb-8 slide-up slide-up-delay-3">
          <p className="ems-label mb-4" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(200,255,0,0.7)" }}>
            Included Features
          </p>
          <div className="flex flex-wrap gap-3">
            {cfg.features.map((feature) => (
              <span
                key={feature}
                className="px-4 py-2 rounded-full text-sm"
                style={{
                  background: "rgba(200,255,0,0.08)",
                  border: "1px solid rgba(200,255,0,0.2)",
                  color: "#C8FF00",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                ✓ {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Alternative note */}
        {result.alternative_note && (
          <div
            className="rounded-xl p-4 mb-8 slide-up slide-up-delay-4"
            style={{
              background: "rgba(255,165,0,0.05)",
              border: "1px solid rgba(255,165,0,0.2)",
            }}
          >
            <p className="text-orange-300 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
              💡 <strong>Note:</strong> {result.alternative_note}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 slide-up slide-up-delay-4">
          <button
            onClick={() => router.push("/")}
            className="volt-btn flex-1 rounded-xl py-4 text-base"
            style={{ fontFamily: "Syne, sans-serif", fontWeight: 700 }}
          >
            ← Try Different Profile
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 rounded-xl py-4 text-base font-semibold transition-all"
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 600,
              background: "transparent",
              border: "1px solid rgba(200,255,0,0.3)",
              color: "#C8FF00",
            }}
          >
            Print / Save Report
          </button>
        </div>
      </div>
    </main>
  );
}
