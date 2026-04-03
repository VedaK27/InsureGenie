import os
import json
from groq import Groq
from dotenv import load_dotenv
from app.database import supabase

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

PLAN_DETAILS = {
    1: {"name": "Elite",    "risk_range": "Below 0.20",  "premium": 350, "label": "Best users"},
    2: {"name": "Pro",      "risk_range": "0.20 - 0.30", "premium": 380, "label": "Very safe"},
    3: {"name": "Advanced", "risk_range": "0.30 - 0.45", "premium": 420, "label": "Slight risk"},
    4: {"name": "Guarded",  "risk_range": "0.45 - 0.60", "premium": 450, "label": "Moderate"},
    5: {"name": "Risky",    "risk_range": "0.60 - 0.75", "premium": 500, "label": "Neutral"},
    6: {"name": "Critical", "risk_range": "0.75 - 0.90", "premium": 550, "label": "Risk loading"},
    7: {"name": "Extreme",  "risk_range": "0.90 - 1.00", "premium": 650, "label": "Very risky"},
}


def get_reverse_underwriting_advice(user_id: int, target_plan_level: int) -> dict:

    # 1. Validate plan level
    if target_plan_level not in PLAN_DETAILS:
        return {"success": False, "error": "Invalid target plan level. Must be between 1 and 7."}

    # 2. Fetch current premium / risk data
    premium_resp = (
        supabase.table("premium")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not premium_resp.data:
        return {"success": False, "error": "No policy data found. Please calculate your insurance quote first."}

    premium = premium_resp.data[0]
    current_plan_level = int(premium.get("policy_plan_id", 5))

    if target_plan_level >= current_plan_level:
        current_name = PLAN_DETAILS[current_plan_level]["name"]
        return {
            "success": False,
            "error": (
                f"Please select a plan better than your current plan "
                f"({current_name}, Level {current_plan_level}). "
                f"Choose a plan with a lower level number."
            ),
        }

    # 3. Recent activity (7-day avg)
    activity_resp = (
        supabase.table("user_activity")
        .select("steps, calories, active_minutes")
        .eq("user_id", user_id)
        .order("recorded_at", desc=True)
        .limit(7)
        .execute()
    )
    activity = activity_resp.data or []
    avg_steps      = int(sum(a.get("steps", 0) for a in activity) / len(activity)) if activity else 0
    avg_calories   = int(sum(a.get("calories", 0) for a in activity) / len(activity)) if activity else 0
    avg_active_min = int(sum(a.get("active_minutes", 0) for a in activity) / len(activity)) if activity else 0

    # 4. Wellness score
    score_resp = (
        supabase.table("user_score")
        .select("score, reward")
        .eq("user_id", user_id)
        .execute()
    )
    score_data = score_resp.data[0] if score_resp.data else {"score": 0, "reward": 0}

    # 5. Insurance inputs for BMI / heart rate (best-effort)
    bmi        = "unknown"
    heart_rate = "unknown"
    try:
        input_resp = (
            supabase.table("insurance_inputs")
            .select("bmi, heart_rate")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if input_resp.data:
            bmi        = input_resp.data[0].get("bmi", "unknown")
            heart_rate = input_resp.data[0].get("heart_rate", "unknown")
    except Exception:
        pass

    # 6. Build variables
    current_plan    = PLAN_DETAILS[current_plan_level]
    target_plan     = PLAN_DETAILS[target_plan_level]
    monthly_savings = current_plan["premium"] - target_plan["premium"]
    current_risk    = premium.get("risk_score", 0.5)
    health_risk     = premium.get("health_risk", "medium")
    lifestyle_risk  = premium.get("lifestyle_risk", "medium")
    driving_risk    = premium.get("driving_risk", "medium")

    # 7. Build LLM prompt
    prompt = f"""
You are an expert insurance underwriter and health coach for InsureGenie, an AI-powered insurance platform.

A user wants to upgrade their insurance plan from their current plan to a better (lower risk) plan.
Your job is to generate a specific, data-driven, actionable improvement roadmap.

CURRENT USER PROFILE:
- Current Plan: {current_plan['name']} (Level {current_plan_level})
- Current Monthly Premium: Rs {current_plan['premium']}/month
- Current Risk Score: {current_risk:.2f} (scale: 0.0 = lowest risk, 1.0 = highest risk)
- Health Risk Category: {health_risk}
- Lifestyle Risk Category: {lifestyle_risk}
- Driving Risk Category: {driving_risk}
- Current BMI: {bmi}
- Resting Heart Rate: {heart_rate} bpm
- Wellness Points Earned: {score_data['score']}

RECENT ACTIVITY (7-day average):
- Daily Steps: {avg_steps}
- Daily Calories Burned: {avg_calories}
- Daily Active Minutes: {avg_active_min}

TARGET PLAN:
- Plan: {target_plan['name']} (Level {target_plan_level})
- Monthly Premium: Rs {target_plan['premium']}/month
- Required Risk Score Range: {target_plan['risk_range']}
- Monthly Savings if Achieved: Rs {monthly_savings}

Return ONLY a valid JSON object — no markdown, no code fences, no extra text.
The JSON must exactly follow this structure:

{{
  "summary": "Two sentences summarizing what must change and how achievable this is given the current profile.",
  "health_actions": [
    "Specific health action with exact target numbers",
    "Specific health action with exact target numbers",
    "Specific health action with exact target numbers"
  ],
  "lifestyle_actions": [
    "Specific daily activity target with exact numbers",
    "Specific daily activity target with exact numbers",
    "Specific daily activity target with exact numbers"
  ],
  "driving_actions": [
    "Specific driving improvement action",
    "Specific driving improvement action"
  ],
  "timeline": "Realistic estimate such as 3 to 6 months with consistent effort",
  "targets": {{
    "daily_steps": 10000,
    "daily_calories_burned": 500,
    "daily_active_minutes": 45,
    "target_bmi_range": "18.5 - 24.9",
    "risk_score_needed": 0.35
  }},
  "difficulty": "Easy or Moderate or Challenging"
}}

Focus improvements on the weakest areas: health is {health_risk}, lifestyle is {lifestyle_risk}, driving is {driving_risk}.
Do not use emojis. Be specific with numbers. Be encouraging but realistic.
""".strip()

    # 8. Call Groq
    if not client:
        return {"success": False, "error": "AI service not configured. Please check GROQ_API_KEY in backend .env"}

    try:
        completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise AI insurance underwriter. "
                        "Always return only valid JSON with no markdown formatting, no emojis, no extra explanation."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=1000,
        )
        raw = completion.choices[0].message.content.strip()

        # Strip markdown code fences if model wraps them anyway
        if raw.startswith("```"):
            parts = raw.split("```")
            raw = parts[1] if len(parts) > 1 else raw
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()
        if raw.endswith("```"):
            raw = raw[:-3].strip()

        advice = json.loads(raw)

    except json.JSONDecodeError:
        advice = {
            "summary": "The AI returned an unstructured response. Key actions are listed below.",
            "health_actions": ["Maintain a BMI between 18.5 and 24.9", "Keep resting heart rate below 80 bpm", "Get an annual health check-up"],
            "lifestyle_actions": [f"Increase daily steps from {avg_steps} to 10,000", "Burn at least 400 calories per day through exercise", "Achieve 30 active minutes daily"],
            "driving_actions": ["Avoid speeding violations for 12 consecutive months", "Maintain a clean driving record"],
            "timeline": "3 to 6 months with consistent effort",
            "targets": {
                "daily_steps": 10000,
                "daily_calories_burned": 400,
                "daily_active_minutes": 30,
                "target_bmi_range": "18.5 - 24.9",
                "risk_score_needed": float(target_plan_level) * 0.13,
            },
            "difficulty": "Moderate",
        }
    except Exception as e:
        return {"success": False, "error": f"AI service error: {str(e)}"}

    return {
        "success":         True,
        "current_plan":    current_plan["name"],
        "current_level":   current_plan_level,
        "target_plan":     target_plan["name"],
        "target_level":    target_plan_level,
        "current_risk":    round(current_risk, 2),
        "monthly_savings": monthly_savings,
        "current_premium": current_plan["premium"],
        "target_premium":  target_plan["premium"],
        "advice":          advice,
        "current_metrics": {
            "health_risk":     health_risk,
            "lifestyle_risk":  lifestyle_risk,
            "driving_risk":    driving_risk,
            "avg_steps":       avg_steps,
            "avg_calories":    avg_calories,
            "avg_active_mins": avg_active_min,
            "bmi":             bmi,
            "heart_rate":      heart_rate,
        },
    }
