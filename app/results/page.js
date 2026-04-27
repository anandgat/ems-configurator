"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ROIChart from "@/components/ROIChart";
import MonthlyBreakdown from "@/components/MonthlyBreakdown";
import SOCChart from "@/components/SOCChart";

export default function Results() {
  const router = useRouter();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const r = sessionStorage.getItem("ems_result");
    if (!r) { router.push("/"); return; }
    setResult(JSON.parse(r));
  }, [router]);

  if (!result) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="flex items-center justify-center">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</p>
      </div>
    );
  }

  const cfg = result.recommended_config;
  const sim = result.simulation;
  const summary = sim?.summary;

  // Debug: log full API response to confirm field values
  console.log("[EMS] full result:", JSON.stringify(result, null, 2));
  console.log("[EMS] summary.reductionPercent:", summary?.reductionPercent);
  console.log("[EMS] summary.numberOfBatteries:", summary?.numberOfBatteries);

  // Prefer simulation-verified battery config over product catalog values
  const batteryCapacityKWh = summary?.batteryCapacityKWh ?? cfg.storage_kwh;
  const minSOCKWh = summary?.minSOCKWh ?? (batteryCapacityKWh * 0.20);
  const systemCostUSD = summary?.systemCostUSD ?? cfg.cost_usd;

  const annualSavings = result.projected_annual_savings_usd;
  const paybackYears = result.actual_payback_years;
  const reductionPct = (() => {
    if (summary && result.baselineAnnualCost && summary.annualNetBill != null) {
      return Math.max(0, ((result.baselineAnnualCost - summary.annualNetBill) / result.baselineAnnualCost * 100)).toFixed(1);
    }
    if (summary?.reductionPercent) {
      return Math.max(0, parseFloat(summary.reductionPercent)).toFixed(1);
    }
    return result.roi_achieved_pct ?? null;
  })();

  const sectionTitle = (text) => (
    <h2
      className="text-sm font-semibold mb-4"
      style={{ color: "var(--text)", fontFamily: "Inter, sans-serif", letterSpacing: "-0.01em" }}
    >
      {text}
    </h2>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
              >
                E
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--text)", fontFamily: "Inter, sans-serif" }}>
                EMS Configurator
              </span>
            </div>
            <span style={{ color: "var(--border)" }}>|</span>
            <span className="text-sm" style={{ color: "var(--text-dim)", fontFamily: "Inter, sans-serif" }}>
              Simulation Results
            </span>
          </div>
          <div className="flex items-center gap-3">
            {sim && (
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: "var(--success-muted)",
                  color: "var(--success)",
                  border: "1px solid rgba(5,150,105,0.25)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.7rem",
                }}
              >
                ● Simulation Verified
              </span>
            )}
            {result.simulationError && (
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: "var(--warning-muted)",
                  color: "var(--warning)",
                  border: "1px solid rgba(217,119,6,0.25)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.7rem",
                }}
              >
                ● AI Estimate Only
              </span>
            )}
            <button
              onClick={() => router.push("/")}
              className="ems-btn-ghost text-xs rounded-lg px-3 py-1.5"
            >
              ← New Simulation
            </button>
            <button
              onClick={() => window.print()}
              className="ems-btn-ghost text-xs rounded-lg px-3 py-1.5"
            >
              Export PDF
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Recommendation banner */}
        <div
          className="rounded-2xl p-6 mb-6 fade-in"
          style={{
            background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
            boxShadow: "0 8px 24px rgba(79,70,229,0.25)",
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Inter, sans-serif", letterSpacing: "0.1em" }}>
                Recommended System
              </p>
              <h1
                className="text-2xl font-bold mb-1.5 leading-tight"
                style={{ color: "#FFFFFF", fontFamily: "Inter, sans-serif" }}
              >
                {cfg.name}
              </h1>
              {cfg.description && (
                <p className="text-xs mb-2.5" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "JetBrains Mono, monospace" }}>
                  {cfg.description}
                </p>
              )}
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Inter, sans-serif", maxWidth: "680px", lineHeight: 1.6 }}>
                {result.reason}
              </p>
            </div>
            <div
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{
                fontFamily: "Inter, sans-serif",
                background: result.roi_meets_target ? "rgba(255,255,255,0.2)" : "rgba(245,158,11,0.3)",
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.3)",
                backdropFilter: "blur(4px)",
              }}
            >
              {result.roi_meets_target ? "✓ ROI Target Met" : "⚠ Partially Met"}
            </div>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 fade-in-1">
          {[
            { label: "System Cost",    value: systemCostUSD ? `$${systemCostUSD.toLocaleString()}` : "N/A", sub: "upfront investment", color: "var(--text)" },
            { label: "Annual Savings", value: annualSavings ? `$${annualSavings.toLocaleString()}` : "N/A", sub: sim ? "simulation-verified" : "AI estimate", color: "var(--success)" },
            { label: "Payback Period", value: paybackYears ? `${paybackYears} yrs` : "N/A", sub: "break-even point", color: "var(--accent)" },
            { label: "Bill Reduction", value: reductionPct != null ? `${reductionPct}%` : "N/A", sub: summary ? "vs. baseline cost" : "estimated", color: "var(--accent)" },
          ].map((stat) => (
            <div key={stat.label} className="stat-box">
              <p className="ems-label mb-2">{stat.label}</p>
              <p
                className="text-2xl font-bold mb-0.5"
                style={{ color: stat.color, fontFamily: "Inter, sans-serif" }}
              >
                {stat.value}
              </p>
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Simulation energy summary */}
        {summary && (
          <div
            className="rounded-xl p-4 mb-6 fade-in-1"
            style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: "Annual Import",    value: `${summary.annualImportKWh?.toFixed(1)} kWh`,  color: "var(--danger)" },
                { label: "Annual Export",    value: `${summary.annualExportKWh?.toFixed(1)} kWh`,  color: "var(--success)" },
                { label: "Import Cost",      value: `$${summary.annualImportCost?.toFixed(0)}`,          color: "var(--danger)" },
                { label: "Export Credit",    value: `-$${summary.annualExportCredit?.toFixed(0)}`,       color: "var(--success)" },
                { label: "Avg Monthly Bill", value: `$${summary.averageMonthlyBill?.toFixed(2)}`,        color: "var(--accent)" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="ems-label mb-1">{s.label}</p>
                  <p className="text-base font-semibold" style={{ color: s.color, fontFamily: "Inter, sans-serif" }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart + Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 fade-in-2">
          <div className="ems-card rounded-xl p-6">
            {sectionTitle("15-Year Cumulative Savings")}
            <ROIChart
              cost={systemCostUSD}
              annualSavings={annualSavings}
              years={15}
              baselineCost={result.baselineAnnualCost}
              simulationNetBill={summary?.annualNetBill}
            />
          </div>

          <div className="ems-card rounded-xl p-6">
            {sectionTitle("System Specifications")}
            <div className="space-y-0">
              {[
                { label: "Capacity",           value: cfg.capacity_kw ? `${cfg.capacity_kw} kW` : null },
                { label: "Storage",            value: batteryCapacityKWh ? `${batteryCapacityKWh} kWh${summary?.numberOfBatteries ? ` (${summary.numberOfBatteries} batteries)` : ""}` : null },
                { label: "Battery Voltage",    value: cfg.battery_voltage ? `${cfg.battery_voltage} V` : null },
                { label: "Depth of Discharge", value: cfg.depth_of_discharge ? `${cfg.depth_of_discharge}%` : null },
                { label: "Best For",           value: cfg.best_for || cfg.description },
              ]
                .filter((s) => s.value)
                .map((spec) => (
                  <div
                    key={spec.label}
                    className="flex justify-between items-start py-2.5"
                    style={{ borderBottom: "1px solid var(--border-light)" }}
                  >
                    <span className="text-xs" style={{ color: "var(--text-dim)", fontFamily: "DM Sans, sans-serif" }}>
                      {spec.label}
                    </span>
                    <span className="text-xs font-medium text-right max-w-[55%]" style={{ color: "var(--text)", fontFamily: "DM Sans, sans-serif" }}>
                      {spec.value}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* SOC Chart */}
        {sim?.months && (
          <div className="ems-card rounded-xl p-6 mb-5 fade-in-3">
            {sectionTitle("State of Charge — Daily Cycle Checkpoints by Month")}
            <SOCChart
              key={summary?.annualNetBill}
              months={sim.months}
              batteryCapacityKWh={batteryCapacityKWh}
              minSOC={minSOCKWh}
            />
          </div>
        )}

        {/* Monthly Breakdown */}
        {sim?.months && (
          <div className="ems-card rounded-xl p-6 mb-5 fade-in-3">
            {sectionTitle("Monthly Financial Breakdown")}
            <MonthlyBreakdown months={sim.months} />
          </div>
        )}

        {/* Features */}
        {cfg.features && cfg.features.length > 0 && (
          <div className="ems-card rounded-xl p-6 mb-5 fade-in-3">
            {sectionTitle("System Features")}
            <div className="flex flex-wrap gap-2">
              {cfg.features.map((feature) => {
                const label = summary?.numberOfBatteries && /\dx Deye/i.test(feature)
                  ? feature.replace(/^\d+x/, `${summary.numberOfBatteries}x`)
                  : feature;
                return (
                  <span
                    key={feature}
                    className="text-xs px-3 py-1.5 rounded-md"
                    style={{
                      background: "var(--accent-muted)",
                      border: "1px solid rgba(79,70,229,0.2)",
                      color: "var(--accent)",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    ✓ {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* What's Next */}
        {sim?.months && (
          <div
            className="rounded-2xl p-8 mb-5 fade-in-4 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div
              className="w-px mx-auto mb-6"
              style={{ height: 32, background: "var(--border)" }}
            />
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-dim)", letterSpacing: "0.12em" }}>
              What would you like to explore next?
            </p>
            <p
              className="text-lg font-semibold mb-6 max-w-md mx-auto"
              style={{ color: "var(--text)", lineHeight: 1.5 }}
            >
              Would you like to see how energy arbitrage could further reduce your bill?
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(79,70,229,0.3)",
              }}
            >
              Yes, show me →
            </button>
          </div>
        )}

        {/* Notices */}
        {result.alternative_note && (
          <div
            className="rounded-xl p-4 mb-5 text-sm fade-in-4"
            style={{ background: "var(--warning-muted)", border: "1px solid rgba(245,158,11,0.2)", color: "var(--warning)" }}
          >
            <strong>Note:</strong> {result.alternative_note}
          </div>
        )}
        {result.simulationError && (
          <div
            className="rounded-xl p-4 mb-5 text-sm fade-in-4"
            style={{ background: "var(--warning-muted)", border: "1px solid rgba(245,158,11,0.2)", color: "var(--warning)" }}
          >
            <strong>Simulation unavailable:</strong> {result.simulationError}. Savings figures shown are AI estimates.
          </div>
        )}

        {/* CTA row */}
        <div className="flex gap-3 mb-12 fade-in-4">
          <button
            onClick={() => router.push("/")}
            className="ems-btn-primary rounded-lg px-5 py-2.5 text-sm"
          >
            ← New Simulation
          </button>
          <button
            onClick={() => window.print()}
            className="ems-btn-ghost rounded-lg px-5 py-2.5 text-sm"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "var(--text-dim)", fontFamily: "Inter, sans-serif" }}>
            © 2025 EMS Configurator. Simulation results are estimates based on historical usage patterns.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Service"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs transition-colors"
                style={{ color: "var(--text-dim)", fontFamily: "Inter, sans-serif", textDecoration: "none" }}
                onMouseEnter={(e) => e.target.style.color = "var(--accent)"}
                onMouseLeave={(e) => e.target.style.color = "var(--text-dim)"}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
