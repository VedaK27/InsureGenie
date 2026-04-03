import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import InsuranceBot from "./InsuranceBot";

// ── Helpers ──────────────────────────────────────────────────────────────────

const riskToPercent = (risk) => {
  switch ((risk || "").toLowerCase()) {
    case "low": return 30;
    case "medium": return 60;
    case "high": return 90;
    default: return 0;
  }
};

const riskColor = (risk) => {
  switch ((risk || "").toLowerCase()) {
    case "low": return "#4caf50";
    case "medium": return "#ff9800";
    case "high": return "#f44336";
    default: return "#7B8794";
  }
};

const PLAN_NAME_TO_LEVEL = {
  Elite: 1, Pro: 2, Advanced: 3, Guarded: 4, Risky: 5, Critical: 6, Extreme: 7,
};

const ALL_PLANS = [
  { level: 1, name: "Elite", premium: 2500, range: "Below 0.20", label: "Best users", color: "#4CAF82" },
  { level: 2, name: "Pro", premium: 4500, range: "0.20 – 0.30", label: "Very safe", color: "#3B82F6" },
  { level: 3, name: "Advanced", premium: 7000, range: "0.30 – 0.45", label: "Slight risk", color: "#6366F1" },
  { level: 4, name: "Guarded", premium: 10000, range: "0.45 – 0.60", label: "Moderate", color: "#F59E0B" },
  { level: 5, name: "Risky", premium: 14000, range: "0.60 – 0.75", label: "Neutral", color: "#EF4444" },
  { level: 6, name: "Critical", premium: 19000, range: "0.75 – 0.90", label: "Risk loading", color: "#DC2626" },
  { level: 7, name: "Extreme", premium: 25000, range: "0.90 – 1.00", label: "Very risky", color: "#7F1D1D" },
];

// ── Reverse Underwriting Modal ────────────────────────────────────────────────

function ReverseUnderwriteModal({ user, policy, onClose }) {
  const [step, setStep] = useState("select");   // select | loading | results | error
  const [result, setResult] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  const currentLevel = PLAN_NAME_TO_LEVEL[policy?.plan_name] || 5;

  const handleSelectPlan = async (targetLevel) => {
    setStep("loading");
    try {
      const res = await fetch("http://localhost:8000/reverse-underwrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, target_plan_level: targetLevel }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrMsg(data.error || "Something went wrong.");
        setStep("error");
      } else {
        setResult(data);
        setStep("results");
      }
    } catch (e) {
      setErrMsg("Could not reach the server. Please try again.");
      setStep("error");
    }
  };

  return (
    <div style={mo.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={mo.box}>

        {/* Close */}
        <button style={mo.closeBtn} onClick={onClose}>x</button>

        {/* ── STEP 1: SELECT ── */}
        {step === "select" && (
          <>
            <div style={mo.header}>
              <p style={mo.tag}>Reverse Underwriting</p>
              <h2 style={mo.title}>Choose Your Target Plan</h2>
              <p style={mo.sub}>
                Select the plan you want to achieve. Our AI will build a personalized
                roadmap to improve your risk profile and unlock it.
              </p>
            </div>

            <div style={mo.planGrid}>
              {ALL_PLANS.map((plan) => {
                const isCurrent = plan.level === currentLevel;
                const isWorse = plan.level > currentLevel;
                const selectable = !isCurrent && !isWorse;
                return (
                  <div
                    key={plan.level}
                    style={{
                      ...mo.planCard,
                      opacity: isWorse ? 0.38 : 1,
                      border: isCurrent
                        ? `2px solid ${plan.color}`
                        : "1px solid #E5E7EB",
                      background: isCurrent ? "#F0FDF4" : "#fff",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <span style={{ ...mo.planName, color: plan.color }}>{plan.name}</span>
                      <span style={{ ...mo.badge, background: plan.color + "20", color: plan.color }}>
                        Level {plan.level}
                      </span>
                    </div>
                    <p style={mo.planPremium}>Rs {plan.premium}<span style={mo.perMonth}>/month</span></p>
                    <p style={mo.planRange}>Risk: {plan.range}</p>
                    <p style={mo.planLabel}>{plan.label}</p>

                    {isCurrent ? (
                      <div style={mo.currentBadge}>Your Current Plan</div>
                    ) : isWorse ? (
                      <div style={mo.disabledLabel}>Not applicable</div>
                    ) : (
                      <button
                        style={{ ...mo.selectBtn, background: plan.color }}
                        onClick={() => handleSelectPlan(plan.level)}
                      >
                        Select this Plan
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── STEP 2: LOADING ── */}
        {step === "loading" && (
          <div style={mo.centerState}>
            <div style={mo.spinner} />
            <h3 style={{ color: "#1A2233", marginBottom: 8 }}>Analyzing your profile...</h3>
            <p style={{ color: "#7B8794", fontSize: 14 }}>
              Our AI is reviewing your risk metrics and building a personalized improvement roadmap.
              This takes a few seconds.
            </p>
          </div>
        )}

        {/* ── STEP 3: RESULTS ── */}
        {step === "results" && result && (
          <ResultsView result={result} onBack={() => setStep("select")} onClose={onClose} />
        )}

        {/* ── STEP 4: ERROR ── */}
        {step === "error" && (
          <div style={mo.centerState}>
            <div style={{ fontSize: 40, marginBottom: 16, color: "#EF4444" }}>!</div>
            <h3 style={{ color: "#1A2233", marginBottom: 8 }}>Unable to Generate Roadmap</h3>
            <p style={{ color: "#7B8794", fontSize: 14, marginBottom: 24, maxWidth: 400 }}>{errMsg}</p>
            <button style={mo.selectBtn} onClick={() => setStep("select")}>Go Back</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Results View ─────────────────────────────────────────────────────────────

function ResultsView({ result, onBack, onClose }) {
  const { advice, current_plan, target_plan, monthly_savings, current_risk, current_metrics } = result;

  const difficultyColor = {
    Easy: "#4CAF82", Moderate: "#F59E0B", Challenging: "#EF4444",
  }[advice.difficulty] || "#7B8794";

  const sections = [
    { title: "Health Improvements", items: advice.health_actions || [], color: "#4CAF82", icon: "H" },
    { title: "Lifestyle Improvements", items: advice.lifestyle_actions || [], color: "#3B82F6", icon: "L" },
    { title: "Driving Improvements", items: advice.driving_actions || [], color: "#F59E0B", icon: "D" },
  ];

  const targets = advice.targets || {};

  return (
    <div>
      {/* Header */}
      <div style={mo.resultsHeader}>
        <div style={mo.planPill}>{current_plan}</div>
        <div style={mo.arrow}>to</div>
        <div style={{ ...mo.planPill, background: "#1A4B8C", color: "#fff" }}>{target_plan}</div>
      </div>

      {/* Savings banner */}
      {monthly_savings > 0 && (
        <div style={mo.savingsBanner}>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#1A4B8C" }}>Rs {monthly_savings}/month</span>
          <span style={{ fontSize: 13, color: "#4CAF82", marginLeft: 8 }}>potential savings</span>
        </div>
      )}

      {/* Summary */}
      <div style={mo.summaryCard}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#1A2233" }}>{advice.summary}</p>
      </div>

      {/* Action sections */}
      <div style={mo.sectionsGrid}>
        {sections.map((sec) => (
          <div key={sec.title} style={mo.sectionCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ ...mo.sectionIcon, background: sec.color }}>{sec.icon}</div>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#1A2233" }}>{sec.title}</span>
            </div>
            <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
              {sec.items.map((item, i) => (
                <li key={i} style={{ fontSize: 13, color: "#374151", marginBottom: 6, lineHeight: 1.5 }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Key Targets */}
      {Object.keys(targets).length > 0 && (
        <div style={mo.targetsCard}>
          <p style={{ fontWeight: 700, fontSize: 13, color: "#1A2233", marginBottom: 12 }}>Key Metric Targets</p>
          <div style={mo.targetsGrid}>
            {targets.daily_steps && (
              <MetricTarget label="Daily Steps" value={targets.daily_steps.toLocaleString()} current={current_metrics.avg_steps.toLocaleString()} />
            )}
            {targets.daily_calories_burned && (
              <MetricTarget label="Calories / Day" value={targets.daily_calories_burned} current={current_metrics.avg_calories} />
            )}
            {targets.daily_active_minutes && (
              <MetricTarget label="Active Min / Day" value={targets.daily_active_minutes} current={current_metrics.avg_active_mins} />
            )}
            {targets.target_bmi_range && (
              <MetricTarget label="BMI Range" value={targets.target_bmi_range} current={current_metrics.bmi} />
            )}
            {targets.risk_score_needed && (
              <MetricTarget label="Risk Score Target" value={targets.risk_score_needed.toFixed(2)} current={result.current_risk.toFixed(2)} />
            )}
          </div>
        </div>
      )}

      {/* Timeline + Difficulty */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ ...mo.infoChip, flex: 1 }}>
          <span style={mo.chipLabel}>Estimated Timeline</span>
          <span style={mo.chipValue}>{advice.timeline}</span>
        </div>
        <div style={{ ...mo.infoChip, flex: "0 1 auto" }}>
          <span style={mo.chipLabel}>Difficulty</span>
          <span style={{ ...mo.chipValue, color: difficultyColor }}>{advice.difficulty}</span>
        </div>
      </div>

      {/* Footer buttons */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button style={mo.outlineBtn} onClick={onBack}>Choose Different Plan</button>
        <button style={mo.primaryBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function MetricTarget({ label, value, current }) {
  return (
    <div style={mo.metricItem}>
      <span style={mo.metricLabel}>{label}</span>
      <span style={mo.metricCurrent}>Now: {current}</span>
      <span style={mo.metricTarget}>Target: {value}</span>
    </div>
  );
}

// ── Modal Styles ──────────────────────────────────────────────────────────────

const mo = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(10,20,40,0.72)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "1rem",
    backdropFilter: "blur(4px)",
  },
  box: {
    background: "#F8FAFF", borderRadius: 24,
    width: "100%", maxWidth: 860,
    maxHeight: "92vh", overflowY: "auto",
    padding: "2.5rem", position: "relative",
    boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
  },
  closeBtn: {
    position: "absolute", top: 16, right: 20,
    background: "transparent", border: "1px solid #D1D5DB",
    borderRadius: 8, padding: "4px 10px",
    fontSize: 16, cursor: "pointer", color: "#4B5563",
    lineHeight: 1.5,
  },
  header: { marginBottom: "1.75rem" },
  tag: {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
    color: "#1A4B8C", textTransform: "uppercase", margin: "0 0 6px",
  },
  title: { fontSize: 22, fontWeight: 800, color: "#1A2233", margin: "0 0 8px" },
  sub: { fontSize: 14, color: "#6B7280", margin: 0, lineHeight: 1.6 },

  planGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
    gap: 12,
  },
  planCard: {
    borderRadius: 14, padding: "1.25rem",
    transition: "box-shadow 0.2s",
    cursor: "default",
  },
  planName: { fontSize: 17, fontWeight: 800 },
  badge: {
    fontSize: 11, fontWeight: 700, padding: "2px 8px",
    borderRadius: 999, letterSpacing: "0.04em",
  },
  planPremium: { fontSize: 22, fontWeight: 800, color: "#1A2233", margin: "8px 0 2px" },
  perMonth: { fontSize: 13, fontWeight: 400, color: "#6B7280" },
  planRange: { fontSize: 12, color: "#6B7280", margin: "0 0 2px" },
  planLabel: { fontSize: 12, color: "#9CA3AF", margin: "0 0 12px" },
  currentBadge: {
    fontSize: 12, fontWeight: 700, color: "#1A4B8C",
    background: "#DBEAFE", padding: "5px 10px",
    borderRadius: 8, textAlign: "center",
  },
  disabledLabel: {
    fontSize: 12, color: "#9CA3AF", textAlign: "center", padding: "5px 0",
  },
  selectBtn: {
    width: "100%", padding: "8px 0", borderRadius: 9,
    border: "none", color: "#fff", fontWeight: 700,
    fontSize: 13, cursor: "pointer",
    background: "#1A4B8C",
    transition: "opacity 0.15s",
  },

  centerState: {
    minHeight: 300,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    textAlign: "center", padding: "2rem",
    gap: 4,
  },
  spinner: {
    width: 48, height: 48,
    border: "4px solid #E5E7EB",
    borderTop: "4px solid #1A4B8C",
    borderRadius: "50%",
    animation: "spin 0.9s linear infinite",
    marginBottom: 20,
  },

  // Results
  resultsHeader: {
    display: "flex", alignItems: "center", gap: 10,
    marginBottom: 16, flexWrap: "wrap",
  },
  planPill: {
    padding: "6px 18px", borderRadius: 999,
    background: "#E5E7EB", color: "#1A2233",
    fontWeight: 700, fontSize: 15,
  },
  arrow: { color: "#6B7280", fontSize: 13 },
  savingsBanner: {
    background: "#F0FDF4", border: "1px solid #BBF7D0",
    borderRadius: 12, padding: "10px 18px",
    marginBottom: 14, display: "flex", alignItems: "center",
  },
  summaryCard: {
    background: "#EFF6FF", border: "1px solid #BFDBFE",
    borderRadius: 12, padding: "14px 18px", marginBottom: 16,
  },
  sectionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12, marginBottom: 16,
  },
  sectionCard: {
    background: "#fff", borderRadius: 12,
    border: "1px solid #E5E7EB", padding: "1.1rem",
  },
  sectionIcon: {
    width: 28, height: 28, borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 700, fontSize: 13,
  },
  targetsCard: {
    background: "#fff", borderRadius: 12,
    border: "1px solid #E5E7EB", padding: "1.1rem", marginBottom: 16,
  },
  targetsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: 10,
  },
  metricItem: {
    background: "#F8FAFF", borderRadius: 8, padding: "10px 12px",
    display: "flex", flexDirection: "column", gap: 3,
  },
  metricLabel: { fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" },
  metricCurrent: { fontSize: 12, color: "#9CA3AF" },
  metricTarget: { fontSize: 13, fontWeight: 700, color: "#1A4B8C" },
  infoChip: {
    background: "#fff", border: "1px solid #E5E7EB",
    borderRadius: 12, padding: "12px 18px",
    display: "flex", flexDirection: "column", gap: 4,
  },
  chipLabel: { fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" },
  chipValue: { fontSize: 14, fontWeight: 700, color: "#1A2233" },
  outlineBtn: {
    padding: "10px 20px", borderRadius: 10,
    border: "1px solid #D1D5DB", background: "#fff",
    color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer",
  },
  primaryBtn: {
    padding: "10px 24px", borderRadius: 10,
    border: "none", background: "#1A4B8C",
    color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
  },
};

// ── Main DashboardPage ────────────────────────────────────────────────────────

export default function DashboardPage({ user }) {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [botOpen, setBotOpen] = useState(false);
  const [ruOpen, setRuOpen] = useState(false);

  useEffect(() => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }
    fetch(`http://localhost:8000/policy-card/${user.id}`)
      .then((r) => r.json())
      .then((d) => {
        // If the backend returned an error (e.g. 404 "No policy found")
        if (d.detail || d.error) {
          setPolicy(null);
        } else {
          setPolicy(d);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Policy fetch error", err);
        setPolicy(null);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div style={{ padding: "2rem", textAlign: "center", marginTop: "100px" }}>Loading Dashboard...</div>;
  if (!policy || !policy.plan_name) return (
    <div style={{ padding: "4rem 5vw", textAlign: "center", paddingTop: "120px" }}>
      <h2>No Insurance Data Found</h2>
      <p>Please calculate your quote first to view your dashboard.</p>
      <Link to="/get-quote" className="btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>
        Get a Quote
      </Link>
    </div>
  );

  return (
    <>
      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ paddingTop: "70px", background: "var(--off-white)", minHeight: "100vh" }}>
        <section style={{ padding: "4rem 5vw" }}>

          {/* HEADER */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div className="section-tag">My Dashboard</div>
              <h2 className="section-title">
                Welcome back, {(policy.user_name || "User").split(" ")[0]}
              </h2>
              <p style={{ color: "var(--text-muted)" }}>
                Active Plan: <strong>{policy.plan_name}</strong>
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-start" }}>
              <Link to="/get-quote" className="btn-primary">
                Recalculate Score
              </Link>
              <button
                id="reverse-underwrite-btn"
                onClick={() => setRuOpen(true)}
                style={{
                  padding: "0.65rem 1.25rem",
                  background: "#1A2233",
                  color: "#E8B84B",
                  border: "none",
                  borderRadius: 50,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Thinking of an Upgrade?
              </button>
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {[
              {
                label: "Risk Score",
                value: (policy.risk_score * 100).toFixed(1),
                sub: policy.risk_level,
                subColor: "#1a7a4a", subBg: "#eafaf1",
              },
              {
                label: "Monthly Premium",
                value: policy.monthly_premium,
                sub: "Auto-renews " + policy.next_renewal,
                subColor: "var(--text-muted)", subBg: "transparent",
              },
              {
                label: "Wellness Points",
                value: policy.wellness_points?.toLocaleString() || 0,
                sub: "Redeem for discounts",
                subColor: "var(--gold)", subBg: "transparent",
              },
              {
                label: "Insurance Savings",
                value: policy.insurance_savings,
                sub: "Based on your lifestyle",
                subColor: "#1a7a4a", subBg: "#eafaf1",
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
                  fontSize: "0.78rem", fontWeight: 600,
                  color: card.subColor, background: card.subBg,
                  padding: card.subBg !== "transparent" ? "0.2rem 0.6rem" : 0,
                  borderRadius: 50,
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
              <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: "1rem" }}>Risk Breakdown</div>

              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "3rem", color: "gold", fontWeight: "bold" }}>
                  {(policy.risk_score * 100).toFixed(1)}
                </div>
                <div style={{ color: "white", opacity: 0.7 }}>Overall Score</div>
              </div>

              {[
                { label: "Health", value: policy.health_risk, pct: riskToPercent(policy.health_risk), color: riskColor(policy.health_risk) },
                { label: "Lifestyle", value: policy.lifestyle_risk, pct: riskToPercent(policy.lifestyle_risk), color: riskColor(policy.lifestyle_risk) },
                { label: "Driving", value: policy.driving_risk, pct: riskToPercent(policy.driving_risk), color: riskColor(policy.driving_risk) },
              ].map((row) => (
                <div key={row.label} style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "white", fontSize: "0.85rem", marginBottom: 4 }}>
                    <span>{row.label}</span>
                    <span style={{ textTransform: "capitalize", opacity: 0.7 }}>{row.value}</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.1)", height: 6, borderRadius: 4 }}>
                    <div style={{ width: `${row.pct}%`, background: row.color, height: 6, borderRadius: 4, transition: "width 0.5s ease" }} />
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
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #F3F4F6" }}>
                  <span style={{ color: "#6B7280", fontSize: 14 }}>{row.label}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{row.value}</span>
                </div>
              ))}
              <Link to="/plans" className="btn-primary" style={{ marginTop: "1.25rem", display: "block", textAlign: "center" }}>
                Upgrade Plan
              </Link>
            </div>
          </div>

        </section>

        {/* BOT BUTTON */}
        <button
          id="bot-open-btn"
          onClick={() => setBotOpen(true)}
          style={{
            position: "fixed", bottom: "20px", right: "20px",
            width: 60, height: 60, borderRadius: "50%",
            background: "black", color: "white",
            border: "none", cursor: "pointer", fontSize: 22,
          }}
        >
          AI
        </button>

        {botOpen && <InsuranceBot onClose={() => setBotOpen(false)} />}

        {/* REVERSE UNDERWRITING MODAL */}
        {ruOpen && (
          <ReverseUnderwriteModal
            user={user}
            policy={policy}
            onClose={() => setRuOpen(false)}
          />
        )}
      </div>
    </>
  );
}