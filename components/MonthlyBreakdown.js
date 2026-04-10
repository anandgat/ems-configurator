"use client";

export default function MonthlyBreakdown({ months }) {
  if (!months || months.length === 0) return null;

  const totals = months.reduce(
    (acc, m) => ({
      consumption: acc.consumption + m.consumptionKWh,
      importCost:   acc.importCost   + m.monthlyImportCost,
      exportCredit: acc.exportCredit + m.monthlyExportCredit,
      tduCost:      acc.tduCost      + m.monthlyTDUCost,
      netBill:      acc.netBill      + m.monthlyNetBill,
    }),
    { consumption: 0, importCost: 0, exportCredit: 0, tduCost: 0, netBill: 0 }
  );

  const thStyle = {
    padding: "8px 12px",
    textAlign: "left",
    fontSize: "0.65rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-dim)",
    fontFamily: "Inter, DM Sans, sans-serif",
    borderBottom: "1px solid var(--border)",
    whiteSpace: "nowrap",
  };

  const tdStyle = (align = "left") => ({
    padding: "9px 12px",
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    fontFamily: "JetBrains Mono, monospace",
    borderBottom: "1px solid var(--border-light)",
    textAlign: align,
  });

  return (
    <div className="overflow-x-auto">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--surface-raised)" }}>
            {["Month", "kWh", "Export %", "Import $", "Export $", "TDU $", "Net Bill", ""].map((h) => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr
              key={m.monthName}
              style={{ transition: "background 0.1s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-raised)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <td style={{ ...tdStyle(), color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontWeight: 500 }}>
                {m.monthName}
              </td>
              <td style={tdStyle("right")}>{m.consumptionKWh.toFixed(0)}</td>
              <td style={{ ...tdStyle("right"), color: "var(--accent)" }}>
                {(m.optimalExportPct * 100).toFixed(0)}%
              </td>
              <td style={{ ...tdStyle("right"), color: "var(--danger)" }}>
                ${m.monthlyImportCost.toFixed(0)}
              </td>
              <td style={{ ...tdStyle("right"), color: "var(--success)" }}>
                -${m.monthlyExportCredit.toFixed(0)}
              </td>
              <td style={{ ...tdStyle("right"), color: "var(--text-dim)" }}>
                ${m.monthlyTDUCost.toFixed(0)}
              </td>
              <td style={{ ...tdStyle("right"), color: "var(--text)", fontWeight: 500 }}>
                ${m.monthlyNetBill.toFixed(0)}
              </td>
              <td style={{ ...tdStyle("center"), padding: "9px 8px" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: m.isViable ? "var(--success)" : "var(--danger)",
                  }}
                  title={m.isViable ? "Viable" : "Non-viable"}
                />
              </td>
            </tr>
          ))}
          {/* Totals */}
          <tr style={{ background: "var(--surface-raised)", borderTop: "1px solid var(--border)" }}>
            <td style={{ ...tdStyle(), color: "var(--text)", fontWeight: 600, fontFamily: "Inter, DM Sans, sans-serif" }}>Annual</td>
            <td style={{ ...tdStyle("right"), color: "var(--text)", fontWeight: 500 }}>{totals.consumption.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
            <td style={tdStyle("right")}>—</td>
            <td style={{ ...tdStyle("right"), color: "var(--danger)", fontWeight: 500 }}>${totals.importCost.toFixed(0)}</td>
            <td style={{ ...tdStyle("right"), color: "var(--success)", fontWeight: 500 }}>-${totals.exportCredit.toFixed(0)}</td>
            <td style={{ ...tdStyle("right"), color: "var(--text-dim)", fontWeight: 500 }}>${totals.tduCost.toFixed(0)}</td>
            <td style={{ ...tdStyle("right"), color: "var(--accent)", fontWeight: 600, fontSize: "0.875rem" }}>${totals.netBill.toFixed(0)}</td>
            <td style={tdStyle()} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
