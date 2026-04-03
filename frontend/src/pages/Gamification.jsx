import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Gamification({ user }) {
  const navigate = useNavigate();
  const [steps, setSteps] = useState("");
  const [calories, setCalories] = useState("");
  const [activeMinutes, setActiveMinutes] = useState("");
  const [distance, setDistance] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Resolve user from prop or localStorage (same pattern as Dashboard)
  const resolvedUser = user || (() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  })();

  // Guard: if no user, send back to login
  if (!resolvedUser) {
    navigate("/");
    return null;
  }

  const addActivity = async () => {
    setError("");
    setResult(null);

    // Basic validation
    if (!steps && !calories && !activeMinutes && !distance) {
      setError("Please fill in at least one field.");
      return;
    }

    const userId = resolvedUser.id || resolvedUser.sub;
    if (!userId) {
      setError("User session invalid. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/activity", {
        user_id: userId,
        steps: Number(steps) || 0,
        calories: Number(calories) || 0,
        active_minutes: Number(activeMinutes) || 0,
        distance: Number(distance) || 0,
      });
      setResult(res.data);
      // Reset fields after success
      setSteps(""); setCalories(""); setActiveMinutes(""); setDistance("");
    } catch (err) {
      console.error(err);
      setError("Failed to record activity. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* ── Nav ── */}
      <nav style={styles.nav}>
        <span style={styles.navBrand}>InsurGenie</span>
        <button style={styles.navBtnOutline} onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </nav>

      <div style={styles.content}>
        <h2 style={styles.heading}>Record Activity</h2>
        <p style={styles.sub}>Log today's activity to earn points and rewards.</p>

        <div style={styles.card}>
          <div style={styles.grid}>
            {[
              { label: "Steps", value: steps, setter: setSteps, placeholder: "e.g. 8000" },
              { label: "Calories Burned", value: calories, setter: setCalories, placeholder: "e.g. 450" },
              { label: "Active Minutes", value: activeMinutes, setter: setActiveMinutes, placeholder: "e.g. 45" },
              { label: "Distance (km)", value: distance, setter: setDistance, placeholder: "e.g. 5.2" },
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label} style={styles.fieldGroup}>
                <label style={styles.label}>{label}</label>
                <input
                  type="number"
                  placeholder={placeholder}
                  value={value}
                  min="0"
                  onChange={e => setter(e.target.value)}
                  style={styles.input}
                />
              </div>
            ))}
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            onClick={addActivity}
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Submitting…" : "Submit Activity"}
          </button>
        </div>

        {/* ── Result ── */}
        {result && (
          <div style={styles.resultCard}>
            <p style={styles.resultTitle}>🎉 Activity Recorded!</p>
            <div style={styles.resultRow}>
              <div style={styles.resultStat}>
                <p style={styles.resultLabel}>Score Earned</p>
                <p style={styles.resultValue}>{result.score}</p>
              </div>
              <div style={styles.resultStat}>
                <p style={styles.resultLabel}>Reward</p>
                <p style={styles.resultValue}>{result.reward}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F4F7FC",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    backgroundColor: "#1A4B8C",
    boxShadow: "0 2px 12px rgba(26,75,140,0.15)",
  },
  navBrand: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#E8B84B",
  },
  navBtnOutline: {
    padding: "8px 18px",
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: "8px",
    fontWeight: "500",
    fontSize: "14px",
    cursor: "pointer",
  },
  content: {
    maxWidth: "640px",
    margin: "2.5rem auto",
    padding: "0 1.5rem",
  },
  heading: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#1A2233",
    marginBottom: "4px",
  },
  sub: {
    fontSize: "14px",
    color: "#7B8794",
    marginBottom: "1.5rem",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    border: "1px solid #D6E8FA",
    padding: "2rem",
    boxShadow: "0 4px 24px rgba(26,75,140,0.08)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "1.5rem",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#5A6475",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #D6E8FA",
    fontSize: "15px",
    color: "#1A2233",
    outline: "none",
    backgroundColor: "#F8FAFD",
    transition: "border-color 0.2s",
  },
  error: {
    backgroundColor: "#FDECEA",
    border: "1px solid #f09595",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#8B1A14",
    fontSize: "14px",
    marginBottom: "1rem",
  },
  submitBtn: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#1A4B8C",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  resultCard: {
    marginTop: "1.5rem",
    backgroundColor: "#fff",
    borderRadius: "14px",
    border: "1px solid #E8B84B",
    padding: "1.5rem",
    boxShadow: "0 2px 12px rgba(232,184,75,0.15)",
  },
  resultTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1A2233",
    margin: "0 0 1rem",
  },
  resultRow: {
    display: "flex",
    gap: "24px",
  },
  resultStat: {
    flex: 1,
  },
  resultLabel: {
    fontSize: "12px",
    color: "#7B8794",
    margin: "0 0 4px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  resultValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1A4B8C",
    margin: 0,
  },
};

export default Gamification;