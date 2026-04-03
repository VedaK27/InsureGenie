import { Link } from "react-router-dom";
import {
  dashboardUser,
  dashboardBreakdown,
  dashboardActivity,
} from "../constants/plans";

export default function DashboardPage() {
  const u = dashboardUser;

  return (
    <div style={{ paddingTop: "70px", background: "var(--off-white)", minHeight: "100vh" }}>
      <section style={{ padding: "4rem 5vw" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="section-tag">My Dashboard</div>
            <h2 className="section-title" style={{ marginBottom: "0.25rem" }}>
              Welcome back, {u.name.split(" ")[0]} 👋
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Active Plan: <strong style={{ color: "var(--navy)" }}>{u.plan}</strong>
            </p>
          </div>
          <Link to="/get-quote" className="btn-primary">
            Recalculate Score ✨
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Risk Score", value: u.riskScore, sub: `${u.riskLevel} Risk`, subColor: "#1a7a4a", subBg: "#eafaf1" },
            { label: "Monthly Premium", value: u.premium, sub: "Auto-renews " + u.renewalDate, subColor: "var(--text-muted)", subBg: "transparent" },
            { label: "Wellness Points", value: u.wellnessPoints.toLocaleString(), sub: "Redeem for discounts", subColor: "var(--gold)", subBg: "transparent" },
            { label: "Claims Used", value: `${u.claimsUsed} / ${u.claimsTotal}`, sub: "This policy year", subColor: "var(--text-muted)", subBg: "transparent" },
          ].map((card) => (
            <div key={card.label} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 18, padding: "1.5rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 8 }}>
                {card.label}
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 900, color: "var(--navy-dark)", lineHeight: 1, marginBottom: 8 }}>
                {card.value}
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: card.subColor, background: card.subBg, padding: card.subBg !== "transparent" ? "0.2rem 0.6rem" : 0, borderRadius: 50 }}>
                {card.sub}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
          <div style={{ background: "var(--navy-dark)", borderRadius: 20, padding: "2rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", marginBottom: "1.5rem" }}>
              Risk Breakdown
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "3rem", fontWeight: 900, color: "var(--gold-light)", lineHeight: 1 }}>
                  {u.riskScore}
                </div>
                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Overall Score
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {dashboardBreakdown.map((row) => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)", width: 70 }}>{row.label}</div>
                    <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 3, background: row.color, width: `${row.pct}%` }} />
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", fontWeight: 600, width: 32, textAlign: "right" }}>{row.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: "2rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              Your Policy
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "Plan Name", value: u.plan },
                { label: "Monthly Premium", value: u.premium + "/month" },
                { label: "Next Renewal", value: u.renewalDate },
                { label: "Risk Level", value: u.riskLevel + " Risk" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{row.label}</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy-dark)" }}>{row.value}</span>
                </div>
              ))}
            </div>
            <Link to="/plans" className="btn-primary" style={{ display: "block", textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
              Upgrade Plan
            </Link>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: "2rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Recent Activity
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Date", "Steps", "Calories", "Heart Rate", "Active Min"].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dashboardActivity.map((row) => (
                  <tr key={row.date} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--navy)" }}>{row.date}</td>
                    <td style={{ padding: "0.85rem 1rem" }}>{row.steps.toLocaleString()}</td>
                    <td style={{ padding: "0.85rem 1rem" }}>{row.calories}</td>
                    <td style={{ padding: "0.85rem 1rem" }}>{row.heartRate} bpm</td>
                    <td style={{ padding: "0.85rem 1rem" }}>{row.activeMin} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}