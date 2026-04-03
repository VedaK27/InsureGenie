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
    // Use the integer DB `id` — NOT Google's `sub` string
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

  return (
    <div style={styles.page}>
      {/* Nav */}
      <nav style={styles.nav}>
        <span style={styles.navBrand}>InsurGenie</span>
        <button style={styles.navBtnOutline} onClick={handleLogout}>Logout</button>
      </nav>

      <div style={styles.content}>
        <div style={styles.welcome}>
          <h2 style={styles.heading}>
            Welcome back{resolvedUser.user_name ? `, ${resolvedUser.user_name.split(" ")[0]}` : ""}! 👋
          </h2>
          <p style={styles.sub}>Here's your wellness snapshot.</p>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* Score cards */}
        {dashboard && (
          <div style={styles.scoreRow}>
            <div style={styles.scoreCard}>
              <p style={styles.scoreLabel}>Total Score</p>
              <p style={styles.scoreValue}>{dashboard.score?.score ?? 0}</p>
            </div>
            <div style={{ ...styles.scoreCard, borderColor: "#E8B84B" }}>
              <p style={styles.scoreLabel}>Reward Badge</p>
              <p style={styles.scoreValue}>{dashboard.score?.reward ?? "—"}</p>
            </div>
            <div style={{ ...styles.scoreCard, borderColor: "#4CAF82" }}>
              <p style={styles.scoreLabel}>Activities Logged</p>
              <p style={styles.scoreValue}>{dashboard.activity?.length ?? 0}</p>
            </div>
          </div>
        )}

        {!dashboard && !error && (
          <div style={styles.scoreRow}>
            {[1,2,3].map(i => <div key={i} style={styles.skeletonCard} />)}
          </div>
        )}

        {/* Big CTA card */}
        <div style={styles.ctaCard}>
          <div style={styles.ctaLeft}>
            <p style={styles.ctaTitle}>Track Your Activity</p>
            <p style={styles.ctaSub}>
              Your device sensors (steps, calories, active minutes) feed directly
              into our scoring engine. Log an activity to earn points and badges.
            </p>
            <button style={styles.ctaBtn} onClick={() => navigate("/gamification")}>
              + Record Activity →
            </button>
          </div>
          <div style={styles.ctaIcon}>🏃</div>
        </div>

        {/* How scoring works */}
        <div style={styles.howCard}>
          <p style={styles.howTitle}>How scoring works</p>
          <div style={styles.howRow}>
            {[
              { icon: "👟", label: "Steps", formula: "1 pt per 100 steps" },
              { icon: "🔥", label: "Calories", formula: "1 pt per 50 cal" },
              { icon: "⏱️", label: "Active mins", formula: "1 pt per 10 min" },
            ].map(({ icon, label, formula }) => (
              <div key={label} style={styles.howItem}>
                <span style={styles.howIcon}>{icon}</span>
                <p style={styles.howLabel}>{label}</p>
                <p style={styles.howFormula}>{formula}</p>
              </div>
            ))}
          </div>
          <div style={styles.badgeRow}>
            {[
              { badge: "🥉 Bronze", min: "1+" },
              { badge: "🥈 Silver", min: "200+" },
              { badge: "🥇 Gold", min: "500+" },
            ].map(({ badge, min }) => (
              <span key={badge} style={styles.badgePill}>{badge} <b>{min} pts</b></span>
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
  scoreRow: { display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "1.5rem" },
  scoreCard: {
    flex: "1 1 160px", backgroundColor: "#fff", borderRadius: "14px",
    border: "1px solid #D6E8FA", padding: "1.5rem",
    boxShadow: "0 2px 12px rgba(26,75,140,0.07)",
  },
  skeletonCard: { flex: "1 1 160px", height: "90px", backgroundColor: "#E8EDF5", borderRadius: "14px" },
  scoreLabel: { fontSize: "12px", color: "#7B8794", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" },
  scoreValue: { fontSize: "28px", fontWeight: "700", color: "#1A4B8C", margin: 0 },
  ctaCard: {
    backgroundColor: "#1A4B8C", borderRadius: "16px", padding: "2rem",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: "1.5rem", boxShadow: "0 4px 24px rgba(26,75,140,0.2)",
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
  howRow: { display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "1.25rem" },
  howItem: { flex: "1 1 120px", backgroundColor: "#F4F7FC", borderRadius: "10px", padding: "1rem", textAlign: "center" },
  howIcon: { fontSize: "24px" },
  howLabel: { fontSize: "13px", fontWeight: "600", color: "#1A2233", margin: "4px 0 2px" },
  howFormula: { fontSize: "12px", color: "#7B8794", margin: 0 },
  badgeRow: { display: "flex", gap: "10px", flexWrap: "wrap" },
  badgePill: {
    padding: "6px 14px", backgroundColor: "#F4F7FC", border: "1px solid #D6E8FA",
    borderRadius: "9999px", fontSize: "13px", color: "#1A2233",
  },
};

export default Dashboard;