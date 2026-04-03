import { Link } from "react-router-dom";
import { dashboardBreakdown, dashboardActivity } from "../constants/plan";
import { useState, useEffect } from "react";
import InsuranceBot from "./InsuranceBot";

const riskToPercent = (risk) => {
  switch (risk) {
    case "low": return 30;
    case "medium": return 60;
    case "high": return 90;
    default: return 0;
  }
};


export default function DashboardPage({ user }) {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [botOpen, setBotOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchPolicy = async () => {
      try {
        const res = await fetch(`http://localhost:8000/policy-card/${user.id}`);
        const data = await res.json();
        console.log("Policy Data:", data);
        setPolicy(data);
      } catch (err) {
        console.error("Error fetching policy:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [user]);

  // ✅ SAFETY
  if (loading) return <div style={{ padding: "2rem" }}>Loading...</div>;
  if (!policy) return <div style={{ padding: "2rem" }}>No data found</div>;

  const breakdown = [
  {
    label: "Health",
    value: policy.health_risk,
    pct: riskToPercent(policy.health_risk),
    color: "#4caf50"
  },
  {
    label: "Lifestyle",
    value: policy.lifestyle_risk,
    pct: riskToPercent(policy.lifestyle_risk),
    color: "#ff9800"
  },
  {
    label: "Driving",
    value: policy.driving_risk,
    pct: riskToPercent(policy.driving_risk),
    color: "#f44336"
  }
];


  return (
    <div style={{ paddingTop: "70px", background: "var(--off-white)", minHeight: "100vh" }}>
      <section style={{ padding: "4rem 5vw" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="section-tag">My Dashboard</div>
            <h2 className="section-title">
              Welcome back, {policy.user_name?.split(" ")[0]} 👋
            </h2>
            <p style={{ color: "var(--text-muted)" }}>
              Active Plan: <strong>{policy.plan_name}</strong>
            </p>
          </div>

          <Link to="/get-quote" className="btn-primary">
            Recalculate Score ✨
          </Link>
        </div>

        {/* CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            {
              label: "Risk Score",
              value: (policy.risk_score * 100).toFixed(1),
              sub: policy.risk_level,
              subColor: "#1a7a4a",
              subBg: "#eafaf1",
            },
            {
              label: "Monthly Premium",
              value: policy.monthly_premium,
              sub: "Auto-renews " + policy.next_renewal,
              subColor: "var(--text-muted)",
              subBg: "transparent",
            },
            {
              label: "Wellness Points",
              value: policy.wellness_points?.toLocaleString() || 0,
              sub: "Redeem for discounts",
              subColor: "var(--gold)",
              subBg: "transparent",
            },
            {
              label: "Insurance Savings",
              value: policy.insurance_savings,
              sub: "Based on your lifestyle",
              subColor: "#1a7a4a",
              subBg: "#eafaf1",
            },
          ].map((card) => (
            <div key={card.label} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 18, padding: "1.5rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>
                {card.label}
              </div>

              <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--navy-dark)" }}>
                {card.value}
              </div>

              <span style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: card.subColor,
                background: card.subBg,
                padding: card.subBg !== "transparent" ? "0.2rem 0.6rem" : 0,
                borderRadius: 50
              }}>
                {card.sub}
              </span>
            </div>
          ))}
        </div>

        {/* GRID SECTION */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>

  {/* RISK BREAKDOWN */}
  <div style={{ background: "var(--navy-dark)", borderRadius: 20, padding: "2rem" }}>
    <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: "1rem" }}>
      Risk Breakdown
    </div>

    {/* Overall Score */}
    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
      <div style={{ fontSize: "3rem", color: "gold", fontWeight: "bold" }}>
        {(policy.risk_score * 100).toFixed(1)}
      </div>
      <div style={{ color: "white", opacity: 0.7 }}>
        Overall Score
      </div>
    </div>

    {/* Dynamic Breakdown */}
    {[
      {
        label: "Health",
        value: policy.health_risk,
        pct: riskToPercent(policy.health_risk),
        color: "#4caf50"
      },
      {
        label: "Lifestyle",
        value: policy.lifestyle_risk,
        pct: riskToPercent(policy.lifestyle_risk),
        color: "#ff9800"
      },
      {
        label: "Driving",
        value: policy.driving_risk,
        pct: riskToPercent(policy.driving_risk),
        color: "#f44336"
      }
    ].map((row) => (
      <div key={row.label} style={{ marginBottom: "1rem" }}>

        {/* Label + Risk text */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          color: "white",
          fontSize: "0.85rem",
          marginBottom: 4
        }}>
          <span>{row.label}</span>
          <span style={{ textTransform: "capitalize", opacity: 0.7 }}>
            {row.value}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ background: "rgba(255,255,255,0.1)", height: 6, borderRadius: 4 }}>
          <div 
            style={{ 
              width: `${row.pct}%`, 
              background: row.color, 
              height: 6,
              borderRadius: 4,
              transition: "width 0.5s ease"
            }} 
          />
        </div>
      </div>
    ))}

  </div>

          {/* POLICY DETAILS */}
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: "2rem" }}>
            <div style={{ marginBottom: "1rem" }}>Your Policy</div>

            {[
              { label: "Plan Name", value: policy.plan_name },
              { label: "Monthly Premium", value: policy.monthly_premium },
              { label: "Next Renewal", value: policy.next_renewal },
              { label: "Risk Level", value: policy.risk_level },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
                <span>{row.label}</span>
                <span>{row.value}</span>
              </div>
            ))}

            <Link to="/plans" className="btn-primary" style={{ marginTop: "1rem", display: "block", textAlign: "center" }}>
              Upgrade Plan
            </Link>
          </div>
        </div>

        {/* ACTIVITY */}
        {/* <div style={{ background: "#fff", borderRadius: 20, padding: "2rem" }}>
          <div>Recent Activity</div>

          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Steps</th>
                <th>Calories</th>
                <th>Heart Rate</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {dashboardActivity.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{row.steps}</td>
                  <td>{row.calories}</td>
                  <td>{row.heartRate}</td>
                  <td>{row.activeMin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> */}
      </section>

      {/* BOT BUTTON */}
      <button
        onClick={() => setBotOpen(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "black",
          color: "white",
        }}
      >
        🤖
      </button>

      {botOpen && <InsuranceBot onClose={() => setBotOpen(false)} />}
    </div>
  );
}