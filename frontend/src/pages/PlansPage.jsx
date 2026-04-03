import { Link } from "react-router-dom";
import { plans, planColors } from "../constants/plans";

export default function PlansPage() {
  return (
    <div style={{ paddingTop: "70px" }}>
      <section style={{ padding: "6rem 5vw" }}>
        <div className="section-header">
          <div className="section-tag">Coverage Plans</div>
          <h2 className="section-title">Pick Your Shield</h2>
          <p className="section-sub">
            Your plan is determined by your AI risk score — 7 tiers from Elite
            to Extreme. The safer you live, the less you pay.
          </p>
        </div>

        <div className="coverage-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {plans.map((plan) => {
            const pc = planColors[plan.level];
            return (
              <div
                key={plan.id}
                className={`cov-card${plan.featured ? " featured" : ""}`}
                style={plan.featured ? {} : { borderTop: `3px solid ${pc.color}` }}
              >
                {plan.badge && (
                  <div className="cov-badge" style={{ background: pc.color, color: "#fff" }}>
                    {plan.badge}
                  </div>
                )}
                <div className="cov-icon">{plan.icon}</div>
                <h3>{plan.name}</h3>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem", color: pc.color }}>
                  Risk Score {plan.riskRange}
                </div>
                <p>{plan.tagline}</p>
                <div className="cov-price" style={{ color: plan.featured ? "var(--gold-light)" : "var(--navy)" }}>
                  &#8377;{plan.premium} <span>{plan.period}</span>
                </div>
                {plan.discount !== 0 && (
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, marginTop: 4, color: plan.discount < 0 ? "#1a7a4a" : "#c0392b" }}>
                    {plan.discount < 0 ? `₹${Math.abs(plan.discount)} savings vs base` : `₹${plan.discount} risk loading`}
                  </div>
                )}
                <ul className="cov-features">
                  {plan.features.map((f) => (
                    <li key={f}><div className="check">&#10003;</div> {f}</li>
                  ))}
                </ul>
                <Link to="/get-quote" className="btn-primary" style={{ marginTop: "1.5rem", display: "block", textAlign: "center", background: pc.color, color: "#fff" }}>
                  Check My Score
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ padding: "4rem 5vw", background: "var(--navy-dark)" }}>
        <div className="section-header">
          <div className="section-tag" style={{ color: "var(--gold-light)" }}>How Tiers Work</div>
          <h2 className="section-title" style={{ color: "#fff" }}>Your Score Decides Your Plan</h2>
          <p className="section-sub" style={{ color: "rgba(255,255,255,0.55)" }}>
            Our AI computes a risk score from 0 (safest) to 1 (riskiest). You are placed in the corresponding tier automatically and can move down by improving your habits.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxWidth: 640 }}>
          {plans.map((plan) => {
            const pc = planColors[plan.level];
            return (
              <div key={plan.id} style={{ display: "flex", alignItems: "center", gap: "1rem", background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "0.85rem 1.25rem", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: "1.4rem", width: 32, textAlign: "center" }}>{plan.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>{plan.name}</span>
                    <span style={{ fontSize: "0.7rem", fontWeight: 600, padding: "0.15rem 0.6rem", borderRadius: 50, background: pc.bg, color: pc.color }}>{plan.label}</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Risk score {plan.riskRange}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: pc.color, fontSize: "1rem" }}>&#8377;{plan.premium}</div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)" }}>/month</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="cta-section">
        <h2>Not Sure Which Tier? <span className="gold">Let AI Decide.</span></h2>
        <p>Get your personalized risk score and we will place you in the right plan automatically.</p>
        <Link to="/get-quote" className="btn-primary" style={{ fontSize: "1rem", padding: "1rem 2.5rem" }}>
          Calculate My Score Free &#10024;
        </Link>
      </section>
    </div>
  );
}