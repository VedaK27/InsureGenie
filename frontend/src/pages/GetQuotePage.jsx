import { useState } from "react";
import { getPolicyPlan, planColors } from "../constants/plans";

const initialForm = {
  steps: "",
  calories: "",
  active_minutes: "",
  heart_rate: "",
  age: "",
  driving_exp: "",
  credit_score: "",
  mileage: "",
  speeding: "",
  accidents: "",
  male: "1",
  vehicle_after_2015: "1",
  sedentary_minutes: "480",
};

/**
 * Client-side mock that mirrors the backend scoring logic.
 */
function computeMockResult(p) {
  const healthRisk = Math.min(1, Math.abs(p.heart_rate - 70) / 50);
  const lifestyleRisk =
    1 -
    (Math.min(1, p.steps / 10000) * 0.5 +
      Math.min(1, p.active_minutes / 60) * 0.5);
  const drivingRisk = Math.min(
    1,
    p.speeding * 0.15 + p.accidents * 0.2 + Math.max(0, (10 - p.driving_exp) / 20)
  );

  const riskScore = healthRisk * 0.35 + lifestyleRisk * 0.3 + drivingRisk * 0.35;
  const plan = getPolicyPlan(riskScore);

  return {
    riskScore,
    riskScoreDisplay: (riskScore * 100).toFixed(1),
    plan: { ...plan, name: plan.plan || plan.name, premium: plan.premium, discount: plan.discount },
    health: healthRisk < 0.2 ? "Excellent" : healthRisk < 0.4 ? "Good" : healthRisk < 0.6 ? "Fair" : "Needs Attention",
    lifestyle: lifestyleRisk < 0.3 ? "Active" : lifestyleRisk < 0.6 ? "Moderate" : "Sedentary",
    driving: p.accidents === 0 && p.speeding === 0 ? "Safe" : "Review Needed",
  };
}

export default function GetQuotePage() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const payload = {
      steps: parseInt(form.steps),
      calories: parseInt(form.calories),
      active_minutes: parseInt(form.active_minutes),
      sedentary_minutes: parseInt(form.sedentary_minutes || 480),
      age: parseInt(form.age),
      male: parseInt(form.male),
      driving_exp: parseInt(form.driving_exp),
      credit_score: parseFloat(form.credit_score),
      mileage: parseInt(form.mileage),
      vehicle_owner: 1,
      vehicle_after_2015: parseInt(form.vehicle_after_2015),
      speeding: parseInt(form.speeding),
      duis: 0,
      accidents: parseInt(form.accidents),
      car_type: 1,
      heart_rate: parseInt(form.heart_rate),
    };

    try {
      const res = await fetch("http://localhost:8000/predict-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const fallbackPlan = getPolicyPlan(data.final_score);
        
        let planData = fallbackPlan;
        if (data.policy_plan) {
            planData = {
                ...fallbackPlan,
                name: data.policy_plan.plan || fallbackPlan.name,
                premium: data.policy_plan.premium,
                discount: data.policy_plan.discount,
                level: data.policy_plan.level,
                label: data.policy_plan.label
            }
        }
        
        setResult({
          riskScore: data.final_score,
          riskScoreDisplay: (data.final_score * 100).toFixed(1),
          plan: planData,
          health: data.breakdown?.health || "—",
          lifestyle: data.breakdown?.lifestyle || "—",
          driving: data.breakdown?.driving || "—",
        });
      } else {
        setResult(computeMockResult(payload));
      }
    } catch {
      setResult(computeMockResult(payload));
    }

    setLoading(false);
  };

  const planColor = result ? planColors[result.plan.level] : null;

  return (
    <div style={{ paddingTop: "70px" }}>
      <section className="predict-section" style={{ padding: "6rem 5vw" }}>
        <div className="section-header">
          <div className="section-tag">Live Risk Engine</div>
          <h2 className="section-title">Get Your Personalized Score</h2>
          <p className="section-sub">
            Fill in your details below and our AI engine will compute your risk
            profile and recommend the right plan instantly.
          </p>
        </div>

        <div className="predict-form">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-section-title">🏃 Lifestyle & Health</div>

              <div className="form-field">
                <label>Daily Steps</label>
                <input type="number" name="steps" value={form.steps} onChange={handleChange} placeholder="e.g. 8000" required />
              </div>
              <div className="form-field">
                <label>Calories Burned</label>
                <input type="number" name="calories" value={form.calories} onChange={handleChange} placeholder="e.g. 2200" required />
              </div>
              <div className="form-field">
                <label>Active Minutes / Day</label>
                <input type="number" name="active_minutes" value={form.active_minutes} onChange={handleChange} placeholder="e.g. 45" required />
              </div>
              <div className="form-field">
                <label>Sedentary Minutes</label>
                <input type="number" name="sedentary_minutes" value={form.sedentary_minutes} onChange={handleChange} placeholder="e.g. 480" required />
              </div>
              <div className="form-field">
                <label>Heart Rate (BPM)</label>
                <input type="number" name="heart_rate" value={form.heart_rate} onChange={handleChange} placeholder="e.g. 72" required />
              </div>

              <div className="form-section-title">🚗 Driving Profile</div>

              <div className="form-field">
                <label>Age</label>
                <input type="number" name="age" value={form.age} onChange={handleChange} placeholder="e.g. 30" required />
              </div>
              <div className="form-field">
                <label>Driving Experience (yrs)</label>
                <input type="number" name="driving_exp" value={form.driving_exp} onChange={handleChange} placeholder="e.g. 8" required />
              </div>
              <div className="form-field">
                <label>Credit Score</label>
                <input type="number" name="credit_score" value={form.credit_score} onChange={handleChange} placeholder="e.g. 740" required />
              </div>
              <div className="form-field">
                <label>Annual Mileage (km)</label>
                <input type="number" name="mileage" value={form.mileage} onChange={handleChange} placeholder="e.g. 15000" required />
              </div>
              <div className="form-field">
                <label>Speeding Tickets (past 3 yrs)</label>
                <input type="number" name="speeding" value={form.speeding} onChange={handleChange} placeholder="e.g. 0" required />
              </div>
              <div className="form-field">
                <label>At-fault Accidents</label>
                <input type="number" name="accidents" value={form.accidents} onChange={handleChange} placeholder="e.g. 0" required />
              </div>
              <div className="form-field">
                <label>Gender</label>
                <select name="male" value={form.male} onChange={handleChange}>
                  <option value="1">Male</option>
                  <option value="0">Female / Other</option>
                </select>
              </div>
              <div className="form-field">
                <label>Vehicle After 2015?</label>
                <select name="vehicle_after_2015" value={form.vehicle_after_2015} onChange={handleChange}>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.95rem", fontSize: "1rem" }} disabled={loading}>
                {loading ? "Calculating… ✨" : "Calculate My Risk Score ✨"}
              </button>
            </div>
          </form>

          {result && (
            <div className="result-box visible">
              <div className="result-top">
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 4 }}>
                    Risk Score
                  </div>
                  <div className="result-score">{result.riskScoreDisplay}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>out of 100</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div className="result-risk" style={{ background: planColor.bg, color: planColor.color, fontSize: "1rem", padding: "0.4rem 1.1rem" }}>
                    {result.plan.icon} {result.plan.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{result.plan.label}</div>
                </div>
              </div>

              <div className="result-plan">
                <h4>Recommended Plan</h4>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                  <p style={{ margin: 0 }}>
                    {result.plan.icon} <strong>{result.plan.name}</strong> — {result.plan.tagline}
                  </p>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--navy)" }}>₹{result.plan.premium}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>/month</span>
                    {result.plan.discount !== 0 && (
                      <div style={{ fontSize: "0.75rem", marginTop: 2, color: result.plan.discount < 0 ? "#1a7a4a" : "#c0392b", fontWeight: 600 }}>
                        {result.plan.discount < 0 ? `₹${Math.abs(result.plan.discount)} savings` : `₹${result.plan.discount} loading`}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {[
                  { label: "Health", value: result.health },
                  { label: "Lifestyle", value: result.lifestyle },
                  { label: "Driving", value: result.driving },
                ].map((item) => (
                  <div key={item.label} style={{ flex: 1, minWidth: 120, background: "var(--off-white)", borderRadius: 10, padding: "0.85rem", textAlign: "center" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--navy)", marginTop: 4 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}