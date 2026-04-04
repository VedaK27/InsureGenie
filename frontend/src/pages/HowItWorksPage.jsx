import React, { useEffect, useRef, useState } from "react";

const steps = [
  {
    id: "01",
    title: "Connect Your Data",
    headline: "Your life, quantified.",
    description:
      "Link your wearables, health apps, and vehicle telematics in minutes. InsureGenie securely ingests real-time activity, vitals, and driving behaviour — building a living profile that reflects who you actually are, not just your age and postcode.",
    accent: "#E8B84B",
  },
  {
    id: "02",
    title: "AI-Powered Risk Assessment",
    headline: "Precision over assumption.",
    description:
      "Our underwriting engine processes thousands of data points the moment they arrive. Forget actuarial tables built on population averages — your premium is calculated on your choices, your habits, and your genuine risk level.",
    accent: "#4facfe",
  },
  {
    id: "03",
    title: "Gamified Dashboard & Rewards",
    headline: "Watch your savings climb.",
    description:
      "A real-time dashboard surfaces your health score, driving index, and projected savings at a glance. Hit milestones and unlock rewards that directly reduce what you pay — insurance that gets better the healthier you live.",
    accent: "#4CAF82",
  },
  {
    id: "04",
    title: "Reverse Underwriting",
    headline: "Set the premium. Build the path.",
    description:
      "Start with the rate you want, not the one you have. Choose a target plan and our AI constructs a precise, personalised roadmap — specific actions across health, lifestyle, and driving that will move your metrics to qualify.",
    accent: "#E8B84B",
  },
  {
    id: "05",
    title: "Upgrade at Your Best Rate",
    headline: "Earn it. Lock it in.",
    description:
      "Once you've hit your targets, a single recalculation updates your policy in real-time. No paperwork, no waiting, no negotiation. Just a better plan, reflecting the better version of you.",
    accent: "#4facfe",
  },
];

export default function HowItWorksPage() {
  const [visibleSteps, setVisibleSteps] = useState(new Set());
  const stepRefs = useRef([]);

  useEffect(() => {
    const observers = stepRefs.current.map((ref, i) => {
      if (!ref) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSteps((prev) => new Set([...prev, i]));
          }
        },
        { threshold: 0.15 }
      );
      obs.observe(ref);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --navy: #0E1622;
          --gold: #E8B84B;
          --text-primary: #1A2233;
          --text-muted: #7B8794;
          --border: #E5E7EB;
          --card-bg: #ffffff;
          --page-bg: #ffffff;
        }

        .hiw-root {
          background: var(--page-bg);
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          color: var(--text-primary);
          padding-top: 80px;
          overflow-x: hidden;
        }

        /* ── Header ── */
        .hiw-hero {
          text-align: center;
          padding: 80px 24px 100px;
          position: relative;
        }
        .hiw-hero::before {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 300px;
          background: radial-gradient(ellipse at center, rgba(232,184,75,0.10) 0%, transparent 70%);
          pointer-events: none;
        }
        .hiw-tag {
          display: inline-block;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold);
          border: 1px solid rgba(232,184,75,0.3);
          padding: 6px 16px;
          border-radius: 50px;
          margin-bottom: 28px;
        }
        .hiw-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 6vw, 5.5rem);
          font-weight: 700;
          line-height: 1.05;
          color: var(--text-primary);
          margin: 0 0 24px;
          letter-spacing: -0.02em;
        }
        .hiw-h1 em {
          font-style: italic;
          color: var(--gold);
        }
        .hiw-subtitle {
          font-size: 1.1rem;
          color: var(--text-muted);
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.75;
          font-weight: 300;
        }

        /* ── Timeline ── */
        .hiw-timeline {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 24px 100px;
          position: relative;
        }
        .hiw-spine {
          position: absolute;
          left: 43px;
          top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, transparent, var(--border) 8%, var(--border) 92%, transparent);
        }

        /* ── Step card ── */
        .hiw-step {
          display: flex;
          gap: 32px;
          margin-bottom: 56px;
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .hiw-step.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hiw-num-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }
        .hiw-num-circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--gold);
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .hiw-step:hover .hiw-num-circle {
          border-color: var(--gold);
          box-shadow: 0 0 0 4px rgba(232,184,75,0.1);
        }

        .hiw-card {
          flex: 1;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 32px 36px;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
          position: relative;
          overflow: hidden;
        }
        .hiw-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--step-accent, var(--gold)), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .hiw-step:hover .hiw-card {
          border-color: rgba(232,184,75,0.25);
          transform: translateY(-3px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
        }
        .hiw-step:hover .hiw-card::before {
          opacity: 1;
        }

        .hiw-card-title {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .hiw-card-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.9rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 14px;
          line-height: 1.15;
          letter-spacing: -0.01em;
        }
        .hiw-card-body {
          font-size: 0.97rem;
          color: var(--text-muted);
          line-height: 1.8;
          font-weight: 300;
          margin: 0;
        }

        /* ── CTA ── */
        .hiw-cta {
          text-align: center;
          padding-bottom: 100px;
        }
        .hiw-cta-label {
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 20px;
        }
        .hiw-cta-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 36px;
          line-height: 1.1;
        }
        .hiw-cta-btn {
          display: inline-block;
          padding: 16px 48px;
          background: var(--gold);
          color: #0E1622;
          text-decoration: none;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 4px 24px rgba(232,184,75,0.3);
        }
        .hiw-cta-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 36px rgba(232,184,75,0.45);
        }

        @media (max-width: 600px) {
          .hiw-spine { display: none; }
          .hiw-num-col { display: none; }
          .hiw-card { padding: 24px; }
          .hiw-card-headline { font-size: 1.5rem; }
        }
      `}</style>

      <div className="hiw-root">

        {/* Hero */}
        <div className="hiw-hero">
          <h1 className="hiw-h1">
            Insurance built around<br /><em>your reality</em>
          </h1>
          <p className="hiw-subtitle">
            Five steps that replace guesswork with precision — and hand control of your premium back to you.
          </p>
        </div>

        {/* Timeline */}
        <div className="hiw-timeline">
          <div className="hiw-spine" />

          {steps.map((step, i) => (
            <div
              key={step.id}
              ref={(el) => (stepRefs.current[i] = el)}
              className={`hiw-step${visibleSteps.has(i) ? " visible" : ""}`}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="hiw-num-col">
                <div className="hiw-num-circle">{step.id}</div>
              </div>

              <div
                className="hiw-card"
                style={{ "--step-accent": step.accent }}
              >
                <div className="hiw-card-title">{step.title}</div>
                <h2 className="hiw-card-headline">{step.headline}</h2>
                <p className="hiw-card-body">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="hiw-cta">
          <div className="hiw-cta-label">Ready to begin?</div>
          <h2 className="hiw-cta-heading">Your better rate<br />starts today.</h2>
          <a href="/login" className="hiw-cta-btn">Get Started</a>
        </div>

      </div>
    </>
  );
}