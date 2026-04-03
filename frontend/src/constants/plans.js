export const planColors = {
  1: { color: "#c8962b", bg: "rgba(200, 150, 43, 0.15)" }, // Elite
  2: { color: "#27ae60", bg: "rgba(39, 174, 96, 0.15)" },  // Pro
  3: { color: "#2980b9", bg: "rgba(41, 128, 185, 0.15)" }, // Advanced
  4: { color: "#f39c12", bg: "rgba(243, 156, 18, 0.15)" }, // Guarded
  5: { color: "#d35400", bg: "rgba(211, 84, 0, 0.15)" },   // Risky
  6: { color: "#c0392b", bg: "rgba(192, 57, 43, 0.15)" },  // Critical
  7: { color: "#900C3F", bg: "rgba(144, 12, 63, 0.15)" },  // Extreme
};

export const plans = [
  {
    id: "elite",
    level: 1,
    icon: "💎",
    name: "Elite",
    label: "Best users",
    riskRange: "0.0 - 0.2",
    premium: 350,
    discount: -150,
    riskLevel: "Very Low",
    featured: true,
    badge: "Most Popular",
    tagline: "The absolute best rates for absolute best behavior.",
    period: "/month",
    features: ["Zero processing fee", "24/7 priority support", "No claim bonus up to 50%"],
  },
  {
    id: "pro",
    level: 2,
    icon: "😎",
    name: "Pro",
    label: "Very safe",
    riskRange: "0.2 - 0.3",
    premium: 380,
    discount: -120,
    riskLevel: "Low",
    featured: false,
    tagline: "Excellent behavior rewarded generously.",
    period: "/month",
    features: ["Standard processing", "24/7 support", "No claim bonus up to 40%"],
  },
  {
    id: "advanced",
    level: 3,
    icon: "⚖️",
    name: "Advanced",
    label: "Slight risk",
    riskRange: "0.3 - 0.45",
    premium: 420,
    discount: -80,
    riskLevel: "Slight",
    featured: false,
    tagline: "Slight risk, still better than average rates.",
    period: "/month",
    features: ["Standard processing", "Email support", "No claim bonus 30%"],
  },
  {
    id: "guarded",
    level: 4,
    icon: "👀",
    name: "Guarded",
    label: "Moderate",
    riskRange: "0.45 - 0.6",
    premium: 450,
    discount: -50,
    riskLevel: "Moderate",
    featured: false,
    tagline: "Average risk profile, standard baseline policy.",
    period: "/month",
    features: ["Standard processing", "Standard support", "No claim bonus 20%"],
  },
  {
    id: "risky",
    level: 5,
    icon: "🚨",
    name: "Risky",
    label: "Neutral",
    riskRange: "0.6 - 0.75",
    premium: 500,
    discount: 0,
    riskLevel: "Elevated",
    featured: false,
    tagline: "Slightly elevated risk, regular market rates.",
    period: "/month",
    features: ["Standard processing", "Standard support", "No claim bonus 10%"],
  },
  {
    id: "critical",
    level: 6,
    icon: "⚠️",
    name: "Critical",
    label: "Risk loading",
    riskRange: "0.75 - 0.9",
    premium: 550,
    discount: 50,
    riskLevel: "High",
    featured: false,
    tagline: "High risk profile, requires small risk loading.",
    period: "/month",
    features: ["Conditions apply", "Standard support", "No claim bonus via app"],
  },
  {
    id: "extreme",
    level: 7,
    icon: "🔴",
    name: "Extreme",
    label: "Very risky",
    riskRange: "0.9 - 1.0",
    premium: 650,
    discount: 150,
    riskLevel: "Very High",
    featured: false,
    tagline: "Highest risk tier, premium includes heavy loading.",
    period: "/month",
    features: ["Mandatory telematics", "Basic support only", "Limited coverage"],
  },
];

export const getPolicyPlan = (riskScore) => {
  if (riskScore < 0.2) return plans[0];
  if (riskScore < 0.3) return plans[1];
  if (riskScore < 0.45) return plans[2];
  if (riskScore < 0.6) return plans[3];
  if (riskScore < 0.75) return plans[4];
  if (riskScore < 0.9) return plans[5];
  return plans[6];
};

export const howItWorksSteps = [
  { num: "01", icon: "📊", title: "Connect Data", description: "Securely link your wearables or fill a quick profile." },
  { num: "02", icon: "🧠", title: "AI Analysis", description: "Our Risk Engine predicts your likelihood of future claims accurately." },
  { num: "03", icon: "🛡️", title: "Get Covered", description: "Get assigned your personalized plan tier instantly. Lower risk = Lower premium." },
];

export const testimonials = [
  { stars: 5, text: "Switched to Elite tier and saved ₹150 instantly. Beautiful experience.", initials: "R", name: "Rahul S.", role: "Elite Policyholder" },
  { stars: 5, text: "The app actually motivated me to drive safer to move to a better tier. It works!", initials: "A", name: "Anjali K.", role: "Pro Policyholder" },
  { stars: 4, text: "Very transparent pricing. No hidden clauses, just AI looking at numbers.", initials: "V", name: "Vikram P.", role: "Advanced Policyholder" },
];

export const heroStats = [
  { value: "0", label: "Paperwork" },
  { value: "30s", label: "To get Quote" },
  { value: "₹1k+", label: "Avg. Savings" },
];

export const heroScoreCard = {
  score: 18,
  tagClass: "tag-low",
  tag: "Elite Tier",
};

export const heroRecommendedPlan = {
  name: "Elite Level ✨",
  discount: "You save ₹150 monthly!",
  price: "₹350",
  period: "/mo",
};

export const dashboardUser = {
  name: "Arjun Sharma",
  plan: "Elite 💎",
  riskScore: 18.5,
  riskLevel: "Very Low",
  premium: "₹350",
  renewalDate: "Oct 12, 2026",
  wellnessPoints: 1250,
  claimsUsed: 0,
  claimsTotal: 2,
};

export const dashboardBreakdown = [
  { label: "Health", pct: 15, color: "#27ae60" },
  { label: "Driving", pct: 10, color: "#27ae60" },
  { label: "Lifestyle", pct: 22, color: "#f39c12" },
];

export const dashboardActivity = [
  { date: "Today", steps: 8400, calories: 450, heartRate: 72, activeMin: 45 },
  { date: "Yesterday", steps: 10200, calories: 600, heartRate: 75, activeMin: 60 },
  { date: "Oct 1", steps: 7500, calories: 410, heartRate: 70, activeMin: 35 },
];