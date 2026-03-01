"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    daily_kwh: "",
    peak_hours: "evening",
    tariff: "",
    roi_pct: "",
    roi_years: "7",
    property_type: "residential",
    primary_goal: "savings",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Something went wrong");
      }

      // Store result and navigate to results page
      sessionStorage.setItem("ems_result", JSON.stringify(data));
      sessionStorage.setItem("ems_input", JSON.stringify(form));
      router.push("/results");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="content min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-volt/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-volt flex items-center justify-center">
              <span className="text-carbon font-bold text-sm">⚡</span>
            </div>
            <span
              className="font-display font-700 text-lg tracking-tight"
              style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }}
            >
              EMS<span className="text-volt">configurator</span>
            </span>
          </div>
          <span className="ems-label" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(200,255,0,0.6)" }}>
            Powered by Gemini 3.1 Pro
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-16 pb-10 max-w-5xl mx-auto w-full">
        <div className="slide-up">
          <p className="ems-label mb-4" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(200,255,0,0.7)" }}>
            AI-Powered Configuration
          </p>
          <h1
            className="text-5xl md:text-7xl font-800 leading-none tracking-tight mb-4"
            style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }}
          >
            Find your <br />
            <span className="text-volt volt-text-glow">perfect EMS</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mt-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Enter your energy profile and ROI expectations. Our AI analyzes
            6 configurations to recommend the optimal system for you.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="px-6 pb-16 max-w-5xl mx-auto w-full">
        <form onSubmit={handleSubmit}>
          <div className="ems-card rounded-2xl p-8 volt-glow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Daily Consumption */}
              <div className="slide-up slide-up-delay-1">
                <label className="ems-label block mb-2" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(200,255,0,0.7)" }}>
                  Daily Consumption (kWh)
                </label>
                <input
                  type="number"
                  name="daily_kwh"
                  value={form.daily_kwh}
                  onChange={handleChange}
                  placeholder="e.g. 25"
                  min="1"
                  max="500"
                  required
                  className="ems-input w-full rounded-lg px-4 py-3 text-base"
                  style={{ background: "rgba(17,24,39,0.8)", border: "1px solid rgba(200,255,0,0.15)", color: "#F9FAFB", fontFamily: "DM Sans, sans-serif" }}
                />
                <p className="text-gray-500 text-xs mt-1">Average household: 20–35 kWh/day</p>
              </div>

              {/* Grid Tariff */}
              <div className="slide-up slide-up-delay-1">
                <label className="ems-label block mb-2" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(200,255,0,0.7)" }}>
                  Grid Tariff ($/kWh)
                </label>
                <input
                  type="number"
                  name="tariff"
                  value={form.tariff}
                  onChange={handleChange}
                  placeholder="e.g. 0.28"
                  step="0.01"
                  min="0.01"
                  required
                  className="ems-input w-full rounded-lg px-4 py-3 text-base"
                  style={{ background: "rgba(17,24,39,0.8)", border: "1px solid rgba(200,255,0,0.15)", color: "#F9FAFB", fontFamily: "DM Sans, sans-serif" }}
                />
                <p className="text-gray-500 text-xs mt-1">Check your electricity bill</p>
              </div>

              {/* ROI Target */}
              <div className="slide-up slide-up-delay-2">
                <label className="ems-label block mb-2" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(200,255,0,0.7)" }}>
                  ROI Target (%)
                </label>
                <input
                  type="number"
                  name="roi_pct"
                  value={form.roi_pct}
                  onChange={handleChange}
                  placeholder="e.g. 15"
                  min="1"
                  max="100"
                  required
                  className="ems-input w-full rounded-lg px-4 py-3 text-base"
                  style={{ background: "rgba(17,24,39,0.8)", border: "1px solid rgba(200,255,0,0.15)", color: "#F9FAFB", fontFamily: "DM Sans, sans-serif" }}
                />
                <p className="text-gray-500 text-xs mt-1">Expected return on your investment</p>
              </div>

              {/* ROI Timeline */}
              <div className="slide-up slide-up-delay-2">
                <label className="ems-label block mb-2" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(200,255,0,0.7)" }}>
                  ROI Timeframe (Years)
                </label>
                <select
                  name="roi_years"
                  value={form.roi_years}
                  onChange={handleChange}
                  className="ems-input w-full rounded-lg px-4 py-3 text-base"
                  style={{ background: "rgba(17,24,39,0.8)", border: "1px solid rgba(200,255,0,0.15)", color: "#F9FAFB", fontFamily: "DM Sans, sans-serif" }}
                >
                  <option value="3">3 years</option>
                  <option value="5">5 years</option>
                  <option value="7">7 years</option>
                  <option value="10">10 years</option>
                  <option value="15">15 years</option>
                </select>
              </div>

              {/* Peak Hours */}
              <div className="slide-up slide-up-delay-3">
                <label className="ems-label block mb-2" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(200,255,0,0.7)" }}>
                  Peak Usage Period
                </label>
                <select
                  name="peak_hours"
                  value={form.peak_hours}
                  onChange={handleChange}
                  className="ems-input w-full rounded-lg px-4 py-3 text-base"
                  style={{ background: "rgba(17,24,39,0.8)", border: "1px solid rgba(200,255,0,0.15)", color: "#F9FAFB", fontFamily: "DM Sans, sans-serif" }}
                >
                  <option value="morning">Morning (6am–12pm)</option>
                  <option value="daytime">Daytime (9am–5pm)</option>
                  <option value="evening">Evening (5pm–10pm)</option>
                  <option value="night">Night (10pm–6am)</option>
                  <option value="all-day">All day (consistent)</option>
                </select>
              </div>

              {/* Property Type */}
              <div className="slide-up slide-up-delay-3">
                <label className="ems-label block mb-2" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(200,255,0,0.7)" }}>
                  Property Type
                </label>
                <select
                  name="property_type"
                  value={form.property_type}
                  onChange={handleChange}
                  className="ems-input w-full rounded-lg px-4 py-3 text-base"
                  style={{ background: "rgba(17,24,39,0.8)", border: "1px solid rgba(200,255,0,0.15)", color: "#F9FAFB", fontFamily: "DM Sans, sans-serif" }}
                >
                  <option value="residential-small">Residential — Small (&lt;150 sqm)</option>
                  <option value="residential">Residential — Standard</option>
                  <option value="residential-large">Residential — Large (&gt;300 sqm)</option>
                  <option value="small-commercial">Small Commercial</option>
                </select>
              </div>

              {/* Primary Goal - full width */}
              <div className="md:col-span-2 slide-up slide-up-delay-4">
                <label className="ems-label block mb-2" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(200,255,0,0.7)" }}>
                  Primary Goal
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: "savings", label: "💰 Cost Savings" },
                    { value: "backup", label: "🔋 Backup Power" },
                    { value: "independence", label: "🌐 Grid Independence" },
                    { value: "environment", label: "🌱 Green Energy" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, primary_goal: opt.value })}
                      className="rounded-lg px-4 py-3 text-sm font-medium transition-all"
                      style={{
                        fontFamily: "DM Sans, sans-serif",
                        background: form.primary_goal === opt.value
                          ? "rgba(200,255,0,0.15)"
                          : "rgba(17,24,39,0.5)",
                        border: form.primary_goal === opt.value
                          ? "1px solid rgba(200,255,0,0.6)"
                          : "1px solid rgba(200,255,0,0.1)",
                        color: form.primary_goal === opt.value ? "#C8FF00" : "#9CA3AF",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 p-4 rounded-lg bg-red-950/50 border border-red-500/30 text-red-400 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="volt-btn w-full rounded-xl py-4 text-lg tracking-wide"
                style={{ fontFamily: "Syne, sans-serif", fontWeight: 700 }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="volt-pulse">⚡</span>
                    Analyzing your profile with Gemini AI...
                  </span>
                ) : (
                  "Find My Best EMS Configuration →"
                )}
              </button>
              <p className="text-center text-gray-600 text-xs mt-3">
                Analysis takes 5–10 seconds
              </p>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
