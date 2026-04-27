"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BOLT = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M9.5 1.5L3.5 9H8.5L6.5 14.5L13.5 6.5H8.5L9.5 1.5Z" fill="white" />
  </svg>
);

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stepIndex, setStepIndex] = useState(-1);
  const [stepFailed, setStepFailed] = useState(false);

  const STEPS = [
    { label: "Fetching product catalog",            detail: "Loading available EMS configurations from backend" },
    { label: "Gemini AI analyzing your profile",    detail: "Selecting optimal configuration for your usage pattern" },
    { label: "Running DailyCycleEngine",            detail: "Simulating 5-phase daily charge/discharge cycle × 12 months" },
    { label: "Optimizing export percentage",        detail: "Binary search for max viable export per month" },
    { label: "Building financial breakdown",        detail: "Calculating import costs, export credits, net bill" },
  ];
  const [productsSource, setProductsSource] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [planSearch, setPlanSearch] = useState("");
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    annual_kwh: "",
    tariff:     "",
    zip_code:   "75001",
  });

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProductsSource(d.error ? "error" : d.source))
      .catch(() => setProductsSource("error"));

    fetch("/api/plans")
      .then((r) => r.json())
      .then((d) => setPlans(d.plans || []))
      .catch((e) => console.error("Failed to load plans:", e));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    if (!planDropdownOpen) return;
    const close = (e) => {
      if (!e.target.closest("[data-plan-dropdown]")) setPlanDropdownOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [planDropdownOpen]);

  const canSubmit = !loading && !!selectedPlanId && !!form.annual_kwh && !!form.tariff && !!form.zip_code;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setStepFailed(false);
    setStepIndex(0);

    // Step 0 → 1 after 400ms (catalog fetch), then HOLD at step 1 (Gemini) until API responds
    const t0 = setTimeout(() => setStepIndex(1), 400);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          annualConsumption:  parseInt(form.annual_kwh, 10),
          currentUtilityRate: parseFloat(form.tariff),
          zipCode:            form.zip_code,
          planId:             selectedPlanId,
          productsSource,
        }),
      });

      clearTimeout(t0);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Something went wrong");

      // Success — quickly advance remaining steps then navigate
      setStepIndex(2);
      await new Promise((r) => setTimeout(r, 400));
      setStepIndex(3);
      await new Promise((r) => setTimeout(r, 400));
      setStepIndex(4);
      await new Promise((r) => setTimeout(r, 400));
      setStepIndex(STEPS.length);
      await new Promise((r) => setTimeout(r, 300));

      sessionStorage.setItem("ems_result", JSON.stringify(data));
      sessionStorage.setItem("ems_input", JSON.stringify({ ...form, planId: selectedPlanId }));
      router.push("/results");
    } catch (err) {
      clearTimeout(t0);
      // Mark current step as failed — overlay stays visible with error
      setStepFailed(true);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
              {BOLT}
            </div>
            <span className="font-semibold" style={{ color: "var(--text)" }}>EMS Configurator</span>
          </div>

          {productsSource && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: productsSource === "backend" ? "var(--success-muted)" : "var(--warning-muted)",
                color:      productsSource === "backend" ? "var(--success)"       : "var(--warning)",
                border: `1px solid ${productsSource === "backend" ? "rgba(5,150,105,0.2)" : "rgba(217,119,6,0.2)"}`,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.62rem",
                letterSpacing: "0.04em",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block", flexShrink: 0 }} />
              API CONNECTION: {productsSource === "backend" ? "STABLE" : "DOWN"}
            </div>
          )}
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="text-center pt-12 pb-8 px-6 fade-in">
        <div className="flex items-center justify-center gap-2 mb-5">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: "var(--accent-light)", color: "var(--accent)", border: "1px solid rgba(79,70,229,0.2)" }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="4" fill="var(--accent)" opacity="0.3"/>
              <circle cx="5" cy="5" r="2" fill="var(--accent)"/>
            </svg>
            Powered by Gemini AI
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: "var(--success-muted)", color: "var(--success)", border: "1px solid rgba(5,150,105,0.2)" }}
          >
            DailyCycleEngine v1.0
          </span>
        </div>
        <h1
          className="text-4xl md:text-5xl font-bold mb-3 leading-tight"
          style={{ color: "var(--text)" }}
        >
          What's your<br />
          <span style={{ color: "var(--accent)" }}>energy situation?</span>
        </h1>
        <p className="text-sm max-w-lg mx-auto mb-5" style={{ color: "var(--text-muted)" }}>
          Enter your energy usage and current plan — Gemini AI selects the optimal configuration, then our simulation engine calculates your real savings through time-of-use energy arbitrage.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {[
            { icon: "⚡", text: "5-phase daily cycle simulation" },
            { icon: "📊", text: "12-month financial breakdown" },
            { icon: "🔋", text: "SOC tracking & export optimization" },
          ].map((f) => (
            <span key={f.text} className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-dim)" }}>
              <span>{f.icon}</span> {f.text}
            </span>
          ))}
        </div>
      </section>

      {/* ── Form ─────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Basic Details */}
          <div className="ems-card rounded-2xl p-6 fade-in-1">
            <h2 className="font-semibold mb-5" style={{ color: "var(--text)" }}>Your Energy Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Annual Consumption */}
              <div>
                <label className="ems-label block mb-1.5">Annual Consumption</label>
                <div className="relative">
                  <input
                    type="number" name="annual_kwh" value={form.annual_kwh}
                    onChange={handleChange} placeholder="e.g. 12,000"
                    min="100" max="200000" required
                    className="ems-input w-full rounded-lg px-3 py-2.5 pr-12 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: "var(--text-dim)" }}>kWh</span>
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>From your annual bill</p>
              </div>

              {/* Utility Rate */}
              <div>
                <label className="ems-label block mb-1.5">Current Utility Rate</label>
                <div className="relative">
                  <input
                    type="number" name="tariff" value={form.tariff}
                    onChange={handleChange} placeholder="e.g. 0.165"
                    step="0.001" min="0.01" required
                    className="ems-input w-full rounded-lg px-3 py-2.5 pr-14 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: "var(--text-dim)" }}>$/kWh</span>
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>Check your electricity bill</p>
              </div>

              {/* ZIP Code */}
              <div>
                <label className="ems-label block mb-1.5">Installation ZIP Code</label>
                <input
                  type="text" name="zip_code" value={form.zip_code}
                  onChange={handleChange} placeholder="e.g. 75001"
                  pattern="[0-9]{5}" maxLength={5} required
                  className="ems-input w-full rounded-lg px-3 py-2.5 text-sm"
                />
                <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>For local tariff data</p>
              </div>
            </div>
          </div>

          {/* Electricity Plan */}
          <div className="ems-card rounded-2xl p-6 fade-in-2" style={{ position: "relative", zIndex: 10 }}>
            <h2 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Current Electricity Plan</h2>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              Select your utility's time-of-use plan. Rates are pulled live from the selected plan for the simulation.
            </p>

            {plans.length === 0 ? (
              <div className="flex items-center gap-2.5 py-4 text-sm" style={{ color: "var(--text-dim)" }}>
                <span className="ems-spinner-dark" />
                Loading available plans…
              </div>
            ) : (
              <div className="relative" data-plan-dropdown>
                {/* Trigger */}
                <button
                  type="button"
                  onClick={() => setPlanDropdownOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all"
                  style={{
                    background: "var(--surface-raised)",
                    border: `1px solid ${planDropdownOpen ? "var(--accent)" : "var(--border)"}`,
                    color: selectedPlanId ? "var(--text)" : "var(--text-dim)",
                    textAlign: "left",
                  }}
                >
                  <span className="truncate">
                    {selectedPlanId
                      ? (() => {
                          const p = plans.find((pl) => pl.id === selectedPlanId);
                          return p ? `${p.planName} — ${p.tduName}` : "Select a plan";
                        })()
                      : "Select a plan…"}
                  </span>
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    style={{ flexShrink: 0, marginLeft: 8, transition: "transform 0.15s", transform: planDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
                    <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Dropdown */}
                {planDropdownOpen && (
                  <div
                    className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      boxShadow: "var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.12))",
                    }}
                  >
                    {/* Search */}
                    <div style={{ padding: "8px 8px 4px", borderBottom: "1px solid var(--border)" }}>
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search by plan name or provider…"
                        value={planSearch}
                        onChange={(e) => setPlanSearch(e.target.value)}
                        className="ems-input w-full rounded-lg px-3 py-2 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Options */}
                    <div style={{ maxHeight: 280, overflowY: "auto" }}>
                      {plans
                        .filter((p) => {
                          const q = planSearch.toLowerCase();
                          return (
                            p.planName?.toLowerCase().includes(q) ||
                            p.tduName?.toLowerCase().includes(q) ||
                            p.zipCode?.toString().includes(q)
                          );
                        })
                        .map((plan) => {
                          const active = selectedPlanId === plan.id;
                          return (
                            <button
                              key={plan.id}
                              type="button"
                              onClick={() => {
                                setSelectedPlanId(plan.id);
                                setPlanDropdownOpen(false);
                                setPlanSearch("");
                              }}
                              className="w-full text-left flex items-center justify-between px-4 py-3 transition-colors"
                              style={{
                                background: active ? "var(--accent-muted)" : "transparent",
                                borderBottom: "1px solid var(--border-light, var(--border))",
                              }}
                              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--surface-raised)"; }}
                              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                            >
                              <div>
                                <p className="text-sm font-medium" style={{ color: active ? "var(--accent)" : "var(--text)" }}>
                                  {plan.planName}
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                                  {plan.tduName} · ZIP {plan.zipCode} · Updated {new Date(plan.updateDate).toLocaleDateString()}
                                </p>
                              </div>
                              {active && (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginLeft: 8 }}>
                                  <path d="M2 7l4 4 6-6" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div
              className="p-4 rounded-xl text-sm"
              style={{ background: "var(--warning-muted)", border: "1px solid rgba(217,119,6,0.2)", color: "var(--warning)" }}
            >
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-2xl py-4 text-base font-semibold flex items-center justify-center gap-2.5 transition-all fade-in-3"
            style={{
              position:    "relative",
              zIndex:      1,
              background:  canSubmit ? "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" : "var(--border)",
              color:       canSubmit ? "#fff" : "var(--text-dim)",
              cursor:      canSubmit ? "pointer" : "not-allowed",
              boxShadow:   canSubmit ? "0 8px 24px rgba(79,70,229,0.3)" : "none",
            }}
          >
            {loading ? (
              <>
                <span className="ems-spinner" />
                Analyzing & simulating…
              </>
            ) : (
              "Run Simulation →"
            )}
          </button>
        </form>

        {/* Footer */}
        <footer
          className="mt-12 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs"
          style={{ borderTop: "1px solid var(--border)", color: "var(--text-dim)" }}
        >
          <span>© 2025 EMS Configurator. AI-driven energy optimization.</span>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service", "Support"].map((l) => (
              <a key={l} href="#" style={{ color: "var(--text-dim)" }}>{l}</a>
            ))}
          </div>
        </footer>
      </div>

      {/* ── Loading overlay ──────────────────────────────────── */}
      {(loading || stepFailed) && stepIndex >= 0 && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)", zIndex: 100 }}
        >
          <div
            className="rounded-2xl p-8 w-full max-w-md mx-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
              >
                {BOLT}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Running Simulation</p>
                <p className="text-xs" style={{ color: "var(--text-dim)" }}>This takes 10–20 seconds</p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {STEPS.map((step, i) => {
                const done    = stepIndex > i && !(stepFailed && stepIndex === i);
                const failed  = stepFailed && stepIndex === i;
                const active  = stepIndex === i && !stepFailed;
                const pending = stepIndex < i;
                return (
                  <div key={step.label} className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: failed  ? "var(--danger)"       :
                                    done    ? "var(--success)"      :
                                    active  ? "var(--accent)"       : "var(--border)",
                        transition: "background 0.3s",
                      }}
                    >
                      {failed ? (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M3 3l4 4M7 3l-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      ) : done ? (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : active ? (
                        <span
                          style={{
                            width: 8, height: 8, borderRadius: "50%",
                            border: "2px solid #fff",
                            borderTopColor: "transparent",
                            display: "inline-block",
                            animation: "spin 0.7s linear infinite",
                          }}
                        />
                      ) : (
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-dim)", display: "inline-block" }} />
                      )}
                    </div>

                    {/* Text */}
                    <div style={{ opacity: pending ? 0.4 : 1, transition: "opacity 0.3s" }}>
                      <p
                        className="text-sm font-medium"
                        style={{ color: failed ? "var(--danger)" : done ? "var(--success)" : active ? "var(--text)" : "var(--text-muted)" }}
                      >
                        {step.label}
                      </p>
                      {failed && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--danger)", opacity: 0.8 }}>
                          {error}
                        </p>
                      )}
                      {(active || done) && !failed && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                          {step.detail}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-6 rounded-full overflow-hidden" style={{ height: 3, background: "var(--border)" }}>
              <div
                style={{
                  height: "100%",
                  width: `${Math.min((stepIndex / STEPS.length) * 100, 100)}%`,
                  background: stepFailed ? "var(--danger)" : "linear-gradient(90deg, #4F46E5, #7C3AED)",
                  transition: "width 0.4s ease",
                  borderRadius: 999,
                }}
              />
            </div>

            {/* Retry on failure */}
            {stepFailed && (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setStepFailed(false); setStepIndex(-1); setError(""); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--text)" }}
                >
                  ← Try Again
                </button>
                <button
                  type="button"
                  onClick={() => { setStepFailed(false); setStepIndex(-1); setError(""); setLoading(false); }}
                  className="py-2.5 px-4 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-dim)" }}
                >
                  ✕ Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
