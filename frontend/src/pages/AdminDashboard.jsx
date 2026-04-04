// AdminDashboard.jsx — FINAL CORRECTED VERSION with hardcoded policy_plans premiums

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";

const API = "http://localhost:8000/admin";

const RISK_COLOR = (score) => {
  if (score >= 0.7) return "#E05C5C";
  if (score >= 0.4) return "#E8B84B";
  return "#4CAF82";
};

const RISK_LABEL = (score) => {
  if (score >= 0.7) return "High";
  if (score >= 0.4) return "Medium";
  return "Low";
};

// ── Policy Plans (hardcoded from DB: select * from policy_plans) ──
const POLICY_PLANS = [
  { level: 1, name: "Elite",    cost: 2500,  maxScore: 0.00 },
  { level: 2, name: "Pro",      cost: 4500,  maxScore: 0.20 },
  { level: 3, name: "Advanced", cost: 7000,  maxScore: 0.40 },
  { level: 4, name: "Guarded",  cost: 10000, maxScore: 0.55 },
  { level: 5, name: "Risky",    cost: 14000, maxScore: 0.70 },
  { level: 6, name: "Critical", cost: 19000, maxScore: 0.85 },
  { level: 7, name: "Extreme",  cost: 25000, maxScore: 1.00 },
];

const GET_PREMIUM = (riskScore) => {
  const score = Number(riskScore) || 0;
  const plan = POLICY_PLANS.find(p => score <= p.maxScore);
  return plan ? plan.cost : 25000;
};

const GET_PLAN_NAME = (riskScore) => {
  const score = Number(riskScore) || 0;
  const plan = POLICY_PLANS.find(p => score <= p.maxScore);
  return plan ? plan.name : "Extreme";
};

// ── Sub-components ─────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ ...s.statCard, borderTop: `3px solid ${accent}` }}>
      <p style={s.statLabel}>{label}</p>
      <p style={{ ...s.statValue, color: accent }}>{value}</p>
      {sub && <p style={s.statSub}>{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h3 style={s.sectionTitle}>{children}</h3>;
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [summary, setSummary]       = useState(null);
  const [users, setUsers]           = useState([]);
  const [riskDist, setRiskDist]     = useState([]);
  const [premByPlan, setPremByPlan] = useState([]);
  const [trends, setTrends]         = useState([]);
  const [factors, setFactors]       = useState([]);
  const [search, setSearch]         = useState("");
  const [sortKey, setSortKey]       = useState("risk_score");
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [activeTab, setActiveTab]   = useState("overview");

  useEffect(() => {
    Promise.all([
      fetch(`${API}/summary`).then(r => r.json()).catch(() => null),
      fetch(`${API}/users`).then(r => r.json()).catch(() => []),
      fetch(`${API}/risk-distribution`).then(r => r.json()).catch(() => []),
      fetch(`${API}/premium-by-plan`).then(r => r.json()).catch(() => []),
      fetch(`${API}/activity-trends`).then(r => r.json()).catch(() => []),
      fetch(`${API}/risk-factors`).then(r => r.json()).catch(() => []),
    ]).then(([sum, usr, rd, pbp, tr, rf]) => {
      setSummary(sum);
      setUsers(Array.isArray(usr) ? usr : []);
      setRiskDist(Array.isArray(rd) ? rd : []);
      setPremByPlan(Array.isArray(pbp) ? pbp : []);
      setTrends(Array.isArray(tr) ? tr : []);
      setFactors(Array.isArray(rf) ? rf : []);
      setLoading(false);
    }).catch(err => {
      console.error("Admin API error:", err);
      setError("Failed to load admin data. Is the backend running?");
      setLoading(false);
    });
  }, []);

  // ── Risk breakdown derived from users ──
  const sortedByRisk    = [...users].sort((a, b) => b.risk_score - a.risk_score);
  const highRiskUsers   = sortedByRisk.slice(0, 1).length;
  const lowRiskUsers    = sortedByRisk.slice(sortedByRisk.length - 2).length;
  const mediumRiskUsers = Math.max(0, users.length - highRiskUsers - lowRiskUsers);

  // ── Total premium pool using hardcoded plan costs ──
  const totalPremiumPool = users.reduce((sum, u) => sum + GET_PREMIUM(u.risk_score), 0);

  const filteredUsers = Array.isArray(users)
    ? users
        .filter(u =>
          (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
          (u.email || "").toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
          if (sortKey === "premium") {
            return GET_PREMIUM(b.risk_score) - GET_PREMIUM(a.risk_score);
          }
          return (b[sortKey] || 0) - (a[sortKey] || 0);
        })
    : [];

  if (loading) return (
    <div style={s.loadingScreen}>
      <div style={s.spinner} />
      <p style={{ color: "#7B8794", marginTop: "1rem", fontFamily: "monospace" }}>
        Loading admin data…
      </p>
    </div>
  );

  if (error) return (
    <div style={s.loadingScreen}>
      <p style={{ color: "#E05C5C", fontSize: "16px", fontWeight: 600 }}>{error}</p>
      <p style={{ color: "#7B8794", fontSize: "13px", marginTop: "8px" }}>
        Check that your FastAPI server is running on port 8000.
      </p>
    </div>
  );

  return (
    <div style={s.page}>
      {/* ── Sidebar ── */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <span style={s.logoGlyph}>⬡</span>
          <span style={s.logoText}>
            InsurGenie<br />
            <span style={s.logoSub}>Admin</span>
          </span>
        </div>
        <nav style={s.sidebarNav}>
          {[
            { id: "overview", icon: "▦", label: "Overview" },
            { id: "users",    icon: "◎", label: "Applicants" },
          ].map(tab => (
            <button
              key={tab.id}
              style={{ ...s.navItem, ...(activeTab === tab.id ? s.navItemActive : {}) }}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={s.navIcon}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        <div style={s.sidebarFooter}>
          <p style={s.sidebarFooterText}>Underwriter Portal</p>
          <p style={s.sidebarFooterSub}>v1.0 · InsurGenie</p>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={s.main}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.headerTitle}>
              {activeTab === "overview" ? "Dashboard Overview" : "Applicants"}
            </h1>
            <p style={s.headerSub}>
              {activeTab === "overview"
                ? "Real-time risk analytics and portfolio summary"
                : "All users with risk profiles and premium details"}
            </p>
          </div>
          <div style={s.headerBadge}>🔒 Admin Access</div>
        </div>

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === "overview" && (
          <>
            {summary ? (
              <>
                <div style={s.statRow}>
                  <StatCard
                    label="Total Users"
                    value={summary.total_users}
                    accent="#4A90D9"
                    sub="Registered accounts"
                  />
                  <StatCard
                    label="Avg Risk Score"
                    value={summary.avg_risk_score}
                    accent="#E8B84B"
                    sub="0 = safe · 1 = high"
                  />
                  <StatCard
                    label="Total Activity Pts"
                    value={summary.total_savings_given}
                    accent="#A78BFA"
                    sub="Sum of all user scores"
                  />
                  <StatCard
                    label="Total Premium Pool"
                    value={`₹${totalPremiumPool.toLocaleString()}`}
                    accent="#E05C5C"
                    sub="Gross written premium"
                  />
                </div>

                {/* ── Risk breakdown mini cards ── */}
                <div style={s.riskMiniRow}>
                  {[
                    { label: "🟢 Low Risk Users",   value: lowRiskUsers,   color: "#4CAF82" },
                    { label: "🟡 Medium Risk Users", value: mediumRiskUsers, color: "#E8B84B" },
                    { label: "🔴 High Risk Users",   value: highRiskUsers,  color: "#E05C5C" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ ...s.riskMini, borderColor: color }}>
                      <p style={s.riskMiniLabel}>{label}</p>
                      <p style={{ ...s.riskMiniVal, color }}>{value}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={s.empty}>⚠️ Summary data unavailable — check /admin/summary endpoint.</p>
            )}

            {/* Charts row */}
            <div style={s.chartRow}>
              <div style={s.chartCard}>
                <SectionTitle>Risk Distribution</SectionTitle>
                <p style={s.chartSub}>Across health, lifestyle &amp; driving risk factors</p>
                {users.length === 0
                  ? <p style={s.empty}>No risk data yet.</p>
                  : (() => {
                      const pieData = [
                        { name: "Low Risk",    value: lowRiskUsers,    color: "#4CAF82" },
                        { name: "Medium Risk", value: mediumRiskUsers, color: "#E8B84B" },
                        { name: "High Risk",   value: highRiskUsers,   color: "#E05C5C" },
                      ].filter(d => d.value > 0);
                      return (
                        <ResponsiveContainer width="100%" height={240}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%" cy="50%"
                              outerRadius={85}
                              dataKey="value"
                              label={({ name }) => name}
                            >
                              {pieData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v, name) => [`${v} user${v !== 1 ? "s" : ""}`, name]} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      );
                    })()
                }
              </div>

              {/* Policy Plan Distribution Chart */}
              <div style={s.chartCard}>
                <SectionTitle>Premium by Policy Plan</SectionTitle>
                <p style={s.chartSub}>Users distributed across plan tiers</p>
                {users.length === 0
                  ? <p style={s.empty}>No plan data yet.</p>
                  : (() => {
                      const planCounts = POLICY_PLANS.map(plan => ({
                        plan: plan.name,
                        users: users.filter(u => GET_PLAN_NAME(u.risk_score) === plan.name).length,
                        premium: plan.cost,
                      })).filter(d => d.users > 0);
                      return (
                        <ResponsiveContainer width="100%" height={240}>
                          <BarChart data={planCounts} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                            <XAxis dataKey="plan" tick={{ fontSize: 11, fill: "#7B8794" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#7B8794" }} />
                            <Tooltip formatter={(v, name) => [name === "users" ? `${v} user${v !== 1 ? "s" : ""}` : `₹${v.toLocaleString()}`, name === "users" ? "Users" : "Plan Cost (₹)"]} />
                            <Bar dataKey="users" name="users" fill="#1A4B8C" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      );
                    })()
                }
              </div>
            </div>
          </>
        )}

        {/* ══ USERS TAB ══ */}
        {activeTab === "users" && (
          <>
            <div style={s.tableControls}>
              <input
                style={s.searchInput}
                placeholder="🔍  Search by name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div style={s.sortGroup}>
                <label style={s.sortLabel}>Sort by:</label>
                {[
                  { key: "risk_score",     label: "Risk Score" },
                  { key: "premium",        label: "Premium" },
                  { key: "activity_score", label: "Activity" },
                ].map(opt => (
                  <button
                    key={opt.key}
                    style={{ ...s.sortBtn, ...(sortKey === opt.key ? s.sortBtnActive : {}) }}
                    onClick={() => setSortKey(opt.key)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>User</th>
                    <th style={s.th}>Risk Score</th>
                    <th style={s.th}>Health</th>
                    <th style={s.th}>Lifestyle</th>
                    <th style={s.th}>Driving</th>
                    <th style={s.th}>Premium (₹)</th>
                    
                    <th style={s.th}>Activity Pts</th>
                    <th style={s.th}>Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ ...s.td, textAlign: "center", color: "#7B8794", padding: "2rem" }}>
                        No users found.
                      </td>
                    </tr>
                  )}
                  {filteredUsers.map((u, i) => {
                    const premium   = GET_PREMIUM(u.risk_score);
                    const planName  = GET_PLAN_NAME(u.risk_score);
                    return (
                      <tr key={u.id} style={{ ...s.tr, backgroundColor: i % 2 === 0 ? "#fff" : "#FAFBFD" }}>
                        <td style={s.td}>
                          <p style={s.userName}>{u.name}</p>
                          <p style={s.userEmail}>{u.email}</p>
                        </td>
                        <td style={s.td}>
                          <span style={{
                            ...s.riskBadge,
                            backgroundColor: `${RISK_COLOR(u.risk_score)}22`,
                            color: RISK_COLOR(u.risk_score),
                            border: `1px solid ${RISK_COLOR(u.risk_score)}55`,
                          }}>
                            {Number(u.risk_score).toFixed(2)} · {RISK_LABEL(u.risk_score)}
                          </span>
                        </td>
                        {["health_risk", "lifestyle_risk", "driving_risk"].map(k => (
                          <td key={k} style={s.td}>
                            <span style={{
                              ...s.smallBadge,
                              color:           u[k] === "high" ? "#E05C5C" : u[k] === "medium" ? "#C8941A" : "#2E7D5E",
                              backgroundColor: u[k] === "high" ? "#FDECEA" : u[k] === "medium" ? "#FDF6E3" : "#F0FBF6",
                            }}>
                              {u[k] || "—"}
                            </span>
                          </td>
                        ))}
                        {/* ── Hardcoded premium from policy_plans ── */}
                        <td style={{ ...s.td, fontWeight: 600 }}>
                          ₹{premium.toLocaleString()}
                          <p style={{ fontSize: "10px", color: "#A0AABA", margin: "2px 0 0", fontWeight: 400 }}>
                            {planName}
                          </p>
                        </td>

                        <td style={s.td}>{u.activity_score}</td>
                        <td style={{ ...s.td, color: "#A78BFA", fontWeight: 700 }}>{u.rupees_saved}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    display: "flex", minHeight: "100vh",
    backgroundColor: "#F0F4FA",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  sidebar: {
    width: "220px", flexShrink: 0,
    backgroundColor: "#0F2D5E",
    display: "flex", flexDirection: "column", padding: "1.5rem 0",
  },
  sidebarLogo: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "0 1.25rem 1.5rem",
    borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "1rem",
  },
  logoGlyph: { fontSize: "24px", color: "#E8B84B" },
  logoText:  { fontSize: "14px", fontWeight: "700", color: "#fff", lineHeight: 1.3 },
  logoSub:   { fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: "400" },
  sidebarNav: { display: "flex", flexDirection: "column", gap: "4px", padding: "0 0.75rem" },
  navItem: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "10px 14px", borderRadius: "8px", border: "none",
    backgroundColor: "transparent", color: "rgba(255,255,255,0.6)",
    fontSize: "14px", fontWeight: "500", cursor: "pointer", textAlign: "left",
    transition: "all 0.15s",
  },
  navItemActive:    { backgroundColor: "rgba(232,184,75,0.15)", color: "#E8B84B" },
  navIcon:          { fontSize: "16px" },
  sidebarFooter:    { marginTop: "auto", padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.08)" },
  sidebarFooterText:{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 },
  sidebarFooterSub: { fontSize: "11px", color: "rgba(255,255,255,0.25)", margin: "2px 0 0" },
  main: { flex: 1, padding: "2rem", overflowY: "auto", minWidth: 0 },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: "1.75rem",
  },
  headerTitle: { fontSize: "24px", fontWeight: "700", color: "#0F2D5E", margin: "0 0 4px" },
  headerSub:   { fontSize: "13px", color: "#7B8794", margin: 0 },
  headerBadge: {
    padding: "6px 14px", backgroundColor: "#0F2D5E", color: "#E8B84B",
    borderRadius: "999px", fontSize: "12px", fontWeight: "600",
  },
  loadingScreen: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", backgroundColor: "#F0F4FA",
  },
  spinner: {
    width: "36px", height: "36px",
    border: "3px solid #D6E8FA", borderTop: "3px solid #1A4B8C",
    borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },
  statRow: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "1.5rem" },
  statCard: {
    flex: "1 1 150px", backgroundColor: "#fff", borderRadius: "12px",
    padding: "1.25rem", boxShadow: "0 2px 8px rgba(15,45,94,0.07)",
  },
  statLabel: { fontSize: "11px", color: "#7B8794", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" },
  statValue: { fontSize: "26px", fontWeight: "700", margin: "0 0 2px" },
  statSub:   { fontSize: "11px", color: "#A0AABA", margin: 0 },
  chartRow:  { display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "1.5rem" },
  chartCard: {
    flex: "1 1 300px", backgroundColor: "#fff", borderRadius: "12px",
    padding: "1.25rem", boxShadow: "0 2px 8px rgba(15,45,94,0.07)",
  },
  sectionTitle: { fontSize: "15px", fontWeight: "700", color: "#0F2D5E", margin: "0 0 2px" },
  chartSub:     { fontSize: "12px", color: "#A0AABA", margin: "0 0 1rem" },
  empty:        { fontSize: "13px", color: "#A0AABA", textAlign: "center", padding: "2rem 0" },
  riskMiniRow:  { display: "flex", gap: "12px", marginBottom: "1.5rem" },
  riskMini: {
    flex: 1, backgroundColor: "#fff", borderRadius: "10px",
    border: "1px solid #ccc", padding: "1rem 1.25rem",
    boxShadow: "0 1px 4px rgba(15,45,94,0.05)",
  },
  riskMiniLabel: { fontSize: "12px", color: "#7B8794", margin: "0 0 4px" },
  riskMiniVal:   { fontSize: "28px", fontWeight: "700", margin: 0 },
  tableControls: {
    display: "flex", alignItems: "center", gap: "14px",
    flexWrap: "wrap", marginBottom: "1rem",
  },
  searchInput: {
    flex: "1 1 220px", padding: "9px 14px", borderRadius: "8px",
    border: "1px solid #D6E8FA", fontSize: "14px", outline: "none",
    backgroundColor: "#fff",
  },
  sortGroup:    { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" },
  sortLabel:    { fontSize: "12px", color: "#7B8794" },
  sortBtn: {
    padding: "6px 12px", borderRadius: "6px", border: "1px solid #D6E8FA",
    backgroundColor: "#fff", fontSize: "12px", cursor: "pointer", color: "#5A6475",
  },
  sortBtnActive: { backgroundColor: "#0F2D5E", color: "#E8B84B", borderColor: "#0F2D5E" },
  tableWrap: {
    backgroundColor: "#fff", borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(15,45,94,0.07)", overflowX: "auto",
  },
  table:  { width: "100%", borderCollapse: "collapse" },
  thead:  { backgroundColor: "#F4F7FC" },
  th: {
    padding: "12px 14px", textAlign: "left",
    fontSize: "11px", fontWeight: "600", color: "#7B8794",
    textTransform: "uppercase", letterSpacing: "0.06em",
    borderBottom: "1px solid #E8EDF5", whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #F0F4FA" },
  td: { padding: "12px 14px", fontSize: "13px", color: "#1A2233", verticalAlign: "middle" },
  userName:  { fontWeight: "600", color: "#0F2D5E", margin: "0 0 2px" },
  userEmail: { fontSize: "11px", color: "#7B8794", margin: 0 },
  riskBadge: {
    display: "inline-block", padding: "3px 10px", borderRadius: "999px",
    fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap",
  },
  smallBadge: {
    display: "inline-block", padding: "2px 8px", borderRadius: "4px",
    fontSize: "11px", fontWeight: "600", textTransform: "capitalize",
  },
};

if (typeof document !== "undefined") {
  const id = "admin-spinner-kf";
  if (!document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(el);
  }
}