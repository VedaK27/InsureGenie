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

  const resolvedUser = user || (() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  })();

  if (!resolvedUser) {
    navigate("/");
    return null;
  }

  const addActivity = async () => {
    setError("");
    setResult(null);

    if (!steps && !calories && !activeMinutes && !distance) {
      setError("Please fill in at least one field.");
      return;
    }

    const userId = resolvedUser.id;
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
      <nav style={styles.nav}>
        <span style={styles.navBrand}>InsurGenie</span>
        <button style={styles.navBtnOutline} onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </nav>

      <div style={styles.content}>
        <h2 style={styles.heading}>Record Activity</h2>
        <p style={styles.sub}>Log your activity to earn points and save on your insurance premium.</p>

        <div style={styles.card}>
          <div style={styles.grid}>
            {[
              { label: "👟 Steps", value: steps, setter: setSteps, placeholder: "e.g. 8000" },
              { label: "🔥 Calories Burned", value: calories, setter: setCalories, placeholder: "e.g. 450" },
              { label: "⏱️ Active Minutes", value: activeMinutes, setter: setActiveMinutes, placeholder: "e.g. 45" },
              { label: "📍 Distance (km)", value: distance, setter: setDistance, placeholder: "e.g. 5.2" },
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

          {/* Live score preview
          {(steps || calories || activeMinutes) ? (
            <div style={styles.preview}>
              <span style={styles.previewLabel}>This session will earn you:</span>
              <span style={styles.previewScore}>
                ~{Math.floor(
                  (Number(steps) || 0) / 100 +
                  (Number(calories) || 0) / 50 +
                  (Number(activeMinutes) || 0) / 10
                )} pts
              </span>
            </div>
          ) : null} */}

          {error && <p style={styles.error}>{error}</p>}

          <button
            onClick={addActivity}
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Submitting…" : "Submit Activity"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div style={styles.resultCard}>
            <p style={styles.resultTitle}>🎉 Activity Recorded!</p>
            <div style={styles.resultRow}>
              <div style={styles.resultStat}>
                <p style={styles.resultLabel}>Total Score</p>
                <p style={styles.resultValue}>{result.score} pts</p>
              </div>
              <div style={{ ...styles.resultStat, borderLeft: "1px solid #E8EDF5", paddingLeft: "1.5rem" }}>
                <p style={styles.resultLabel}>💰 Insurance Savings</p>
                <p style={{ ...styles.resultValue, color: "#2E7D5E" }}>₹{result.reward} saved</p>
                <p style={styles.resultHint}>Cumulative total</p>
              </div>
            </div>
          </div>
        )}

        {/* Info pill */}
        <div style={styles.infoPill}>
          💡 Every 100 points = ₹1 off your insurance premium. Keep it up!
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
  content: { maxWidth: "640px", margin: "2.5rem auto", padding: "0 1.5rem" },
  heading: { fontSize: "26px", fontWeight: "700", color: "#1A2233", margin: "0 0 4px" },
  sub: { fontSize: "14px", color: "#7B8794", marginBottom: "1.5rem" },
  card: {
    backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #D6E8FA",
    padding: "2rem", boxShadow: "0 4px 24px rgba(26,75,140,0.08)", marginBottom: "1.25rem",
  },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "1.25rem" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "500", color: "#5A6475" },
  input: {
    padding: "10px 14px", borderRadius: "8px", border: "1px solid #D6E8FA",
    fontSize: "15px", color: "#1A2233", outline: "none", backgroundColor: "#F8FAFD",
  },
  preview: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#F0FBF6", border: "1px solid #A7D7BB", borderRadius: "8px",
    padding: "10px 14px", marginBottom: "1rem",
  },
  previewLabel: { fontSize: "13px", color: "#2E7D5E" },
  previewScore: { fontSize: "16px", fontWeight: "700", color: "#2E7D5E" },
  error: {
    backgroundColor: "#FDECEA", border: "1px solid #f09595", borderRadius: "8px",
    padding: "10px 14px", color: "#8B1A14", fontSize: "14px", marginBottom: "1rem",
  },
  submitBtn: {
    width: "100%", padding: "13px", backgroundColor: "#1A4B8C", color: "#fff",
    border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer",
  },
  resultCard: {
    backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #4CAF82",
    padding: "1.5rem", boxShadow: "0 2px 12px rgba(76,175,130,0.15)", marginBottom: "1.25rem",
  },
  resultTitle: { fontSize: "16px", fontWeight: "600", color: "#1A2233", margin: "0 0 1rem" },
  resultRow: { display: "flex", gap: "1.5rem" },
  resultStat: { flex: 1 },
  resultLabel: { fontSize: "12px", color: "#7B8794", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" },
  resultValue: { fontSize: "28px", fontWeight: "700", color: "#1A4B8C", margin: "0 0 2px" },
  resultHint: { fontSize: "11px", color: "#7B8794", margin: 0 },
  infoPill: {
    backgroundColor: "#EEF5FD", border: "1px solid #D6E8FA", borderRadius: "10px",
    padding: "12px 16px", fontSize: "13px", color: "#1A4B8C", textAlign: "center",
  },
};

export default Gamification;