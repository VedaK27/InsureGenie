import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  const resolvedUser = user || (() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  })();

  useEffect(() => {
    if (!resolvedUser) navigate("/");
  }, [resolvedUser, navigate]);

  useEffect(() => {
    if (!resolvedUser) return;
    const userId = resolvedUser.id;
    if (!userId) return;

    axios.get(`http://localhost:8000/dashboard/${userId}`)
      .then(res => setDashboard(res.data))
      .catch(err => {
        console.error(err);
        setError("Failed to load dashboard data.");
      });
  }, [resolvedUser]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    if (setUser) setUser(null);
    navigate("/");
  };

  if (!resolvedUser) return null;

  const score = dashboard?.score?.score ?? 0;
  const reward = dashboard?.score?.reward ?? 0;   // integer ₹
  const activityCount = dashboard?.activity?.length ?? 0;

  // Progress to next ₹1 milestone
  const progressPct = score % 100;

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.navBrand}>InsurGenie</span>
        <button style={styles.navBtnOutline} onClick={handleLogout}>Logout</button>
      </nav>

      <div style={styles.content}>
        <div style={styles.welcome}>
          <h2 style={styles.heading}>
            Welcome back{resolvedUser.user_name ? `, ${resolvedUser.user_name.split(" ")[0]}` : ""}! 👋
          </h2>
          <p style={styles.sub}>Keep moving — every step saves you money on your insurance.</p>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* Score cards */}
        <div style={styles.scoreRow}>
          <div style={styles.scoreCard}>
            <p style={styles.scoreLabel}>Total Points</p>
            {dashboard
              ? <p style={styles.scoreValue}>{score}</p>
              : <div style={styles.skeleton} />}
          </div>

          <div style={{ ...styles.scoreCard, borderColor: "#4CAF82", backgroundColor: "#F0FBF6" }}>
            <p style={styles.scoreLabel}>💰 Insurance Savings</p>
            {dashboard
              ? <p style={{ ...styles.scoreValue, color: "#2E7D5E" }}>₹{reward}</p>
              : <div style={styles.skeleton} />}
            <p style={styles.scoreHint}>Every 100 pts = ₹1 saved</p>
          </div>

          <div style={{ ...styles.scoreCard, borderColor: "#A78BFA" }}>
            <p style={styles.scoreLabel}>Activities Logged</p>
            {dashboard
              ? <p style={{ ...styles.scoreValue, color: "#6D28D9" }}>{activityCount}</p>
              : <div style={styles.skeleton} />}
          </div>
        </div>

        {/* Progress bar to next rupee */}
        {dashboard && (
          <div style={styles.progressCard}>
            <div style={styles.progressHeader}>
              <span style={styles.progressLabel}>Progress to next ₹1 saved</span>
              <span style={styles.progressPct}>{progressPct}/100 pts</span>
            </div>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
            </div>
            <p style={styles.progressHint}>
              {100 - progressPct} more points to unlock ₹{reward + 1} in savings!
            </p>
          </div>
        )}

        {/* CTA */}
        <div style={styles.ctaCard}>
          <div style={styles.ctaLeft}>
            <p style={styles.ctaTitle}>Record Today's Activity</p>
            <p style={styles.ctaSub}>
              Log your steps, calories and active minutes. Your score accumulates
              over time — the more you move, the more you save on your premium.
            </p>
            <button style={styles.ctaBtn} onClick={() => navigate("/gamification")}>
              + Record Activity →
            </button>
          </div>
          <div style={styles.ctaIcon}>🏃</div>
        </div>

        {/* Scoring info */}
        <div style={styles.howCard}>
          <p style={styles.howTitle}>How it works</p>
          <div style={styles.howRow}>
            {[
              { icon: "👟", label: "Steps", formula: "1 pt / 100 steps" },
              { icon: "🔥", label: "Calories", formula: "1 pt / 50 cal" },
              { icon: "⏱️", label: "Active mins", formula: "1 pt / 10 min" },
              { icon: "💰", label: "Savings", formula: "₹1 / 100 pts" },
            ].map(({ icon, label, formula }) => (
              <div key={label} style={styles.howItem}>
                <span style={styles.howIcon}>{icon}</span>
                <p style={styles.howLabel}>{label}</p>
                <p style={styles.howFormula}>{formula}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#F4F7FC", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "1rem 2rem", backgroundColor: "#1A4B8C",
    boxShadow: "0 2px 12px rgba(26,75,140,0.15)",
  },
  navBrand: { fontSize: "18px", fontWeight: "700", color: "#E8B84B" },
  navBtnOutline: {
    padding: "8px 18px", backgroundColor: "transparent", color: "#fff",
    border: "1px solid rgba(255,255,255,0.4)", borderRadius: "8px",
    fontWeight: "500", fontSize: "14px", cursor: "pointer",
  },
  content: { maxWidth: "860px", margin: "2.5rem auto", padding: "0 1.5rem" },
  welcome: { marginBottom: "1.5rem" },
  heading: { fontSize: "26px", fontWeight: "700", color: "#1A2233", margin: "0 0 4px" },
  sub: { fontSize: "14px", color: "#7B8794", margin: 0 },
  error: {
    backgroundColor: "#FDECEA", border: "1px solid #f09595", borderRadius: "8px",
    padding: "12px 16px", color: "#8B1A14", fontSize: "14px", marginBottom: "1.5rem",
  },
  scoreRow: { display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "1.25rem" },
  scoreCard: {
    flex: "1 1 180px", backgroundColor: "#fff", borderRadius: "14px",
    border: "1px solid #D6E8FA", padding: "1.5rem",
    boxShadow: "0 2px 12px rgba(26,75,140,0.07)",
  },
  scoreLabel: { fontSize: "12px", color: "#7B8794", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" },
  scoreValue: { fontSize: "32px", fontWeight: "700", color: "#1A4B8C", margin: "0 0 2px" },
  scoreHint: { fontSize: "11px", color: "#7B8794", margin: 0 },
  skeleton: { height: "38px", backgroundColor: "#E8EDF5", borderRadius: "8px", marginBottom: "4px" },
  progressCard: {
    backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #D6E8FA",
    padding: "1.25rem 1.5rem", marginBottom: "1.25rem",
    boxShadow: "0 2px 12px rgba(26,75,140,0.05)",
  },
  progressHeader: { display: "flex", justifyContent: "space-between", marginBottom: "10px" },
  progressLabel: { fontSize: "13px", fontWeight: "600", color: "#1A2233" },
  progressPct: { fontSize: "13px", color: "#7B8794" },
  progressTrack: { height: "10px", backgroundColor: "#E8EDF5", borderRadius: "999px", overflow: "hidden", marginBottom: "8px" },
  progressFill: { height: "100%", backgroundColor: "#4CAF82", borderRadius: "999px", transition: "width 0.5s ease" },
  progressHint: { fontSize: "12px", color: "#7B8794", margin: 0 },
  ctaCard: {
    backgroundColor: "#1A4B8C", borderRadius: "16px", padding: "2rem",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: "1.25rem", boxShadow: "0 4px 24px rgba(26,75,140,0.2)",
  },
  ctaLeft: { flex: 1 },
  ctaTitle: { fontSize: "20px", fontWeight: "700", color: "#fff", margin: "0 0 8px" },
  ctaSub: { fontSize: "14px", color: "rgba(255,255,255,0.75)", margin: "0 0 1.25rem", maxWidth: "420px", lineHeight: 1.6 },
  ctaBtn: {
    padding: "12px 24px", backgroundColor: "#E8B84B", color: "#1A2233",
    border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "15px", cursor: "pointer",
  },
  ctaIcon: { fontSize: "72px", marginLeft: "2rem", userSelect: "none" },
  howCard: {
    backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #E8EDF5",
    padding: "1.5rem", boxShadow: "0 2px 12px rgba(26,75,140,0.05)",
  },
  howTitle: { fontSize: "15px", fontWeight: "600", color: "#1A2233", margin: "0 0 1rem" },
  howRow: { display: "flex", gap: "12px", flexWrap: "wrap" },
  howItem: { flex: "1 1 120px", backgroundColor: "#F4F7FC", borderRadius: "10px", padding: "1rem", textAlign: "center" },
  howIcon: { fontSize: "24px" },
  howLabel: { fontSize: "13px", fontWeight: "600", color: "#1A2233", margin: "4px 0 2px" },
  howFormula: { fontSize: "12px", color: "#7B8794", margin: 0 },
};

export default Dashboard;