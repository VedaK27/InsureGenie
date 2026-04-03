import { Link } from "react-router-dom";
import { plans } from "../constants/plan";

export default function PlansPage() {
  return (
    <div style={{
      paddingTop: "70px",
      backgroundColor: "#ffffff",
      minHeight: "100vh",
      color: "#0E1622",
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>

      {/* Hero Header */}
      <section style={{
        padding: "5rem 5vw 3rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <div style={{ marginBottom: "0.75rem" }}>
          <span style={{
            fontSize: "0.75rem",
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontWeight: "700",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#E8B84B",
          }}>
            Coverage Tiers
          </span>
        </div>
        <h1 style={{
          fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
          fontWeight: "700",
          color: "#0E1622",
          letterSpacing: "-1.5px",
          lineHeight: 1.1,
          margin: "0 0 1.5rem",
        }}>
          Find Your Perfect Plan
        </h1>
        <p style={{
          color: "#6b7280",
          fontSize: "1.1rem",
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          maxWidth: "520px",
          lineHeight: 1.7,
          margin: 0,
        }}>
          Each tier is calibrated to your risk profile. Compare plans below — or let our AI place you automatically.
        </p>

        {/* Divider */}
        <div style={{
          marginTop: "3rem",
          height: "1px",
          background: "linear-gradient(90deg, #E8B84B 0%, #e8b84b33 60%, transparent 100%)",
        }} />
      </section>

      {/* Table */}
      <section style={{ padding: "0 5vw 5rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "0.95rem",
            minWidth: "500px",
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
          }}>
            <thead>
              <tr>
                {["Tier", "Plan Name", "Monthly Premium", "Annual Premium"].map((heading, i) => (
                  <th key={i} style={{
                    padding: "14px 20px",
                    fontWeight: "700",
                    fontSize: "0.72rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#9ca3af",
                    borderBottom: "1px solid #e5e7eb",
                    whiteSpace: "nowrap",
                  }}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans.map((plan, idx) => (
                <tr
                  key={plan.id}
                  style={{
                    borderBottom: "1px solid #f3f4f6",
                    transition: "background-color 0.15s",
                    cursor: "default",
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fffbf0"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  {/* Tier badge */}
                  <td style={{ padding: "22px 20px" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      letterSpacing: "0.06em",
                      background: idx === 0
                        ? "#fef3c7"
                        : idx === 1
                          ? "#fde68a"
                          : idx === 2
                            ? "#E8B84B"
                            : "#0E1622",
                      color: idx >= 3 ? "#fff" : "#92400e",
                    }}>
                      {plan.level}
                    </span>
                  </td>

                  {/* Plan name */}
                  <td style={{ padding: "22px 20px" }}>
                    <span style={{
                      fontFamily: "'Georgia', serif",
                      fontWeight: "700",
                      fontSize: "1.05rem",
                      color: "#0E1622",
                    }}>
                      {plan.name}
                    </span>
                  </td>

                  {/* Monthly */}
                  <td style={{ padding: "22px 20px" }}>
                    <span style={{ fontWeight: "700", color: "#0E1622", fontSize: "1.05rem" }}>
                      ₹{plan.premium.toLocaleString()}
                    </span>
                    <span style={{ color: "#9ca3af", fontSize: "0.82rem", marginLeft: "4px" }}>/mo</span>
                  </td>

                  {/* Annual */}
                  <td style={{ padding: "22px 20px" }}>
                    <span style={{ color: "#374151", fontWeight: "500" }}>
                      ₹{plan.annualPremium.toLocaleString()}
                    </span>
                    <span style={{ color: "#9ca3af", fontSize: "0.82rem", marginLeft: "4px" }}>/yr</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footnote */}
        <p style={{
          marginTop: "1.5rem",
          fontSize: "0.82rem",
          color: "#9ca3af",
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
        }}>
          * All premiums are indicative. Final pricing determined by your risk assessment.
        </p>
      </section>

      {/* CTA Banner */}
      <section style={{
        background: "#0E1622",
        padding: "5rem 5vw",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative accent */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, #E8B84B, #f5d47a, #E8B84B)",
        }} />
        {/* Gold circle blur */}
        <div style={{
          position: "absolute",
          right: "-80px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,184,75,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ maxWidth: "560px" }}>
            <h2 style={{
              fontFamily: "'Georgia', serif",
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: "700",
              color: "#ffffff",
              letterSpacing: "-0.5px",
              lineHeight: 1.2,
              margin: "0 0 1rem",
            }}>
              Not sure which tier?{" "}
              <span style={{ color: "#E8B84B" }}>Let AI decide.</span>
            </h2>
            <p style={{
              color: "#9ca3af",
              fontSize: "1rem",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              lineHeight: 1.7,
              margin: 0,
            }}>
              Get your personalized risk score and we'll place you in the right plan automatically — in under 2 minutes.
            </p>
          </div>

          <Link
            to="/get-quote"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              fontSize: "0.95rem",
              padding: "1rem 2.2rem",
              background: "#E8B84B",
              color: "#0E1622",
              fontWeight: "700",
              borderRadius: "6px",
              textDecoration: "none",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              letterSpacing: "0.03em",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              flexShrink: 0,
              boxShadow: "0 4px 20px rgba(232,184,75,0.3)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(232,184,75,0.45)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(232,184,75,0.3)";
            }}
          >
            Calculate My Score Free ✦
          </Link>
        </div>
      </section>
    </div>
  );
}