import { Link } from "react-router-dom";
import { theme } from "../constants/theme";
import {
  howItWorksSteps,
  testimonials,
  heroStats,
  heroScoreCard,
  heroRecommendedPlan,
} from "../constants/plan";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="hero-badge">
              <span className="dot"></span>AI-Powered Insurance
            </div>
            <h1>
              Insurance That <span className="gold">Knows You</span> Better Than
              You Do.
            </h1>
            <p>
              InsurGenie analyzes your health, lifestyle, and driving behavior in
              real time — delivering a personalized risk score and the plan built
              exactly for you.
            </p>
            <div className="hero-actions">
              <Link to="/get-quote" className="btn-primary">
                Get My Score
              </Link>
              <a href="#how" className="btn-ghost">
                See How It Works
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="score-card">
              <div className="score-label">Your Risk Profile</div>
              <div className="score-main">
                <div className="score-value">{heroScoreCard.score}</div>
                <div className={`score-tag ${heroScoreCard.tagClass}`}>
                  {heroScoreCard.tag}
                </div>
              </div>
              <div className="score-bar">
                <div
                  className="score-fill"
                  style={{ width: `${heroScoreCard.score}%` }}
                ></div>
              </div>
            </div>

            <div className="score-card mini-stats">
              {heroStats.map((stat) => (
                <div key={stat.label} className="mini-stat">
                  <div className="ms-val">{stat.value}</div>
                  <div className="ms-lbl">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="score-card">
              <div className="score-label">Recommended Plan</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 600, color: "#fff" }}>
                    {heroRecommendedPlan.name}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
                    {heroRecommendedPlan.discount}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#e8b84b" }}>
                    {heroRecommendedPlan.price}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
                    {heroRecommendedPlan.period}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="trust-bar">
        {theme.trustItems.map((item) => (
          <div key={item.label} className="trust-item">
            <span className="trust-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>

      <section className="how" id="how">
        <div className="section-header">
          <div className="section-tag">The Process</div>
          <h2 className="section-title">Three Steps to Your Perfect Policy</h2>
          <p className="section-sub">
            No lengthy forms. No hidden fees. Just smart insurance that adapts
            to how you actually live.
          </p>
        </div>
        <div className="steps-grid">
          {howItWorksSteps.map((step) => (
            <div key={step.num} className="step-card">
              <div className="step-num">{step.num}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="testimonials">
        <div className="section-header">
          <div className="section-tag">Real People</div>
          <h2 className="section-title">Our Policyholders Love InsurGenie</h2>
        </div>
        <div className="testi-grid">
          {testimonials.map((t) => (
            <div key={t.name} className="testi-card">
              <div className="testi-stars">
                {"★".repeat(t.stars)}
                {"☆".repeat(5 - t.stars)}
              </div>
              <p className="testi-text">"{t.text}"</p>
              <div className="testi-author">
                <div className="testi-avatar">{t.initials}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>
          Your Wish. Our <span className="gold">Command.</span>
        </h2>
        <p>
          Join 50,000+ Indians who let InsurGenie grant them smarter, fairer
          insurance.
        </p>
        <Link
          to="/get-quote"
          className="btn-primary"
          style={{ fontSize: "1rem", padding: "1rem 2.5rem" }}
        >
          Calculate My Score Free ✨
        </Link>
      </section>
    </>
  );
}