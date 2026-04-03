import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Core logic unchanged ──────────────────────────────────────────────────
  const handleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/auth/google", {
        token: credentialResponse.credential,
      });

      console.log("User:", res.data);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect to questionnaire after successful login
      navigate("/Home");
    } catch (err) {
      console.error(err);
      setError("Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={styles.page}>
      {/* Left panel — branding */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          {/* Logo area */}
          <div style={styles.logoRow}>
            <img
              src="/logo.png"
              alt="InsurGenie logo"
              style={styles.logoImg}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <span style={styles.logoText}>InsurGenie</span>
          </div>

          <h1 style={styles.heroHeading}>
            Insurance<br />Made Magical.
          </h1>
          <p style={styles.heroSub}>
            Smart coverage tailored to you — find the perfect policy in minutes,
            not hours.
          </p>

          {/* Feature pills */}
          <div style={styles.pillRow}>
            {["Instant quotes", "100% paperless", "24/7 support"].map((f) => (
              <span key={f} style={styles.pill}>{f}</span>
            ))}
          </div>
        </div>

        {/* Decorative lamp accent */}
        <div style={styles.lampAccent}>
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <ellipse cx="90" cy="130" rx="70" ry="18" fill="rgba(232,184,75,0.15)" />
            <path d="M40 110 Q55 80 90 78 Q125 80 140 110 Q130 125 90 128 Q50 125 40 110Z"
              fill="rgba(200,148,26,0.25)" stroke="rgba(232,184,75,0.5)" strokeWidth="1" />
            <path d="M80 78 Q82 55 90 40 Q98 55 100 78"
              fill="none" stroke="rgba(232,184,75,0.6)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="90" cy="36" r="5" fill="rgba(232,184,75,0.7)" />
            <path d="M60 110 Q90 105 120 110" stroke="rgba(200,148,26,0.4)" strokeWidth="1" fill="none" />
          </svg>
        </div>
      </div>

      {/* Right panel — login card */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          {/* Card header */}
          <div style={styles.cardHeader}>
            <div style={styles.cardLogoSmall}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="11" fill="#1A4B8C" />
                <text x="11" y="15" textAnchor="middle" fontSize="12" fill="#E8B84B" fontWeight="700">G</text>
              </svg>
            </div>
            <div>
              <h2 style={styles.cardTitle}>Welcome back</h2>
              <p style={styles.cardSub}>Sign in to your InsurGenie account</p>
            </div>
          </div>

          <div style={styles.divider} />

          {/* Benefits list */}
          <ul style={styles.benefitsList}>
            {[
              { icon: "✦", text: "View & manage your policies" },
              { icon: "✦", text: "Get personalised insurance quotes" },
              { icon: "✦", text: "Track claims in real time" },
            ].map((b) => (
              <li key={b.text} style={styles.benefitItem}>
                <span style={styles.benefitIcon}>{b.icon}</span>
                <span style={styles.benefitText}>{b.text}</span>
              </li>
            ))}
          </ul>

          <div style={styles.divider} />

          {/* Google sign-in */}
          <div style={styles.googleWrapper}>
            <p style={styles.signInLabel}>Continue with Google</p>
            {loading ? (
              <div style={styles.loadingRow}>
                <div style={styles.spinner} />
                <span style={styles.loadingText}>Signing you in…</span>
              </div>
            ) : (
              <div style={styles.googleBtnWrap}>
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => setError("Sign-in failed. Please try again.")}
                  theme="outline"
                  size="large"
                  width="320"
                  shape="rectangular"
                />
              </div>
            )}

            {error && (
              <div style={styles.errorBox}>
                <span style={styles.errorIcon}>!</span>
                <span style={styles.errorText}>{error}</span>
              </div>
            )}
          </div>

          {/* Footer note */}
          <p style={styles.footerNote}>
            By signing in you agree to InsurGenie's{" "}
            <a href="/terms" style={styles.footerLink}>Terms of Service</a>{" "}
            and{" "}
            <a href="/privacy" style={styles.footerLink}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    backgroundColor: "#F4F7FC",
  },

  // Left branding panel
  leftPanel: {
    flex: "1 1 45%",
    backgroundColor: "#1A4B8C",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "3rem 3.5rem",
    position: "relative",
    overflow: "hidden",
  },
  leftContent: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    flex: 1,
    justifyContent: "center",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoImg: {
    width: "44px",
    height: "44px",
    objectFit: "contain",
  },
  logoText: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
    letterSpacing: "-0.01em",
  },
  heroHeading: {
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: "1.15",
    fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
    letterSpacing: "-0.02em",
    margin: 0,
  },
  heroSub: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.75)",
    lineHeight: "1.65",
    maxWidth: "340px",
    margin: 0,
  },
  pillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  pill: {
    padding: "6px 14px",
    borderRadius: "9999px",
    backgroundColor: "rgba(232,184,75,0.18)",
    border: "1px solid rgba(232,184,75,0.4)",
    color: "#E8B84B",
    fontSize: "13px",
    fontWeight: "500",
  },
  lampAccent: {
    alignSelf: "flex-end",
    opacity: 0.8,
  },

  // Right login panel
  rightPanel: {
    flex: "1 1 55%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    backgroundColor: "#F4F7FC",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    border: "1px solid #D6E8FA",
    padding: "2.25rem 2rem",
    boxShadow: "0 4px 24px rgba(26,75,140,0.10)",
  },

  // Card header
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "1.5rem",
  },
  cardLogoSmall: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    backgroundColor: "#EEF5FD",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1A2233",
    margin: "0 0 2px",
    fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
  },
  cardSub: {
    fontSize: "13px",
    color: "#5A6475",
    margin: 0,
  },

  divider: {
    height: "1px",
    backgroundColor: "#E8EDF5",
    margin: "0 0 1.5rem",
  },

  // Benefits
  benefitsList: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  benefitItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  benefitIcon: {
    fontSize: "10px",
    color: "#C8941A",
    flexShrink: 0,
  },
  benefitText: {
    fontSize: "14px",
    color: "#5A6475",
  },

  // Google sign-in
  googleWrapper: {
    marginBottom: "1.5rem",
  },
  signInLabel: {
    fontSize: "13px",
    color: "#7B8794",
    marginBottom: "14px",
    textAlign: "center",
  },
  googleBtnWrap: {
    display: "flex",
    justifyContent: "center",
  },

  // Loading
  loadingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "12px",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid #D6E8FA",
    borderTop: "2px solid #3A7BD5",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  loadingText: {
    fontSize: "14px",
    color: "#5A6475",
  },

  // Error
  errorBox: {
    marginTop: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#FDECEA",
    border: "1px solid #f09595",
    borderRadius: "8px",
    padding: "10px 14px",
  },
  errorIcon: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    backgroundColor: "#C0392B",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    lineHeight: 1,
    textAlign: "center",
  },
  errorText: {
    fontSize: "13px",
    color: "#8B1A14",
  },

  // Footer
  footerNote: {
    fontSize: "12px",
    color: "#A0AABA",
    textAlign: "center",
    lineHeight: "1.6",
    margin: 0,
  },
  footerLink: {
    color: "#3A7BD5",
    textDecoration: "none",
  },
};

// Spinner keyframe — inject once
if (typeof document !== "undefined") {
  const styleId = "insurgenie-spinner";
  if (!document.getElementById(styleId)) {
    const s = document.createElement("style");
    s.id = styleId;
    s.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(s);
  }
}

export default Login;