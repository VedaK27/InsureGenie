# app/admin_routes.py

from fastapi import APIRouter
from app.database import supabase

admin_router = APIRouter(prefix="/admin", tags=["Admin"])


# ── 1. Summary stats ─────────────────────────────────────────────────────────
@admin_router.get("/summary")
def get_summary():
    users_res      = supabase.table("users").select("id", count="exact").execute()
    premium_res    = supabase.table("premium").select("risk_score, premium_amount, discount_amount", count="exact").execute()
    activity_res   = supabase.table("user_activity").select("id", count="exact").execute()
    # FIX: fetch score (number) not reward (string tier like "Gold")
    score_res      = supabase.table("user_score").select("score, reward").execute()

    premiums = premium_res.data or []
    scores   = score_res.data or []

    avg_risk      = round(sum(float(p["risk_score"]) for p in premiums) / len(premiums), 2) if premiums else 0
    total_premium = round(sum(float(p["premium_amount"]) for p in premiums), 2)

    # FIX: reward is a string ("Gold"/"Silver"/"Bronze"/None), NOT a number.
    # Use score (integer) for the savings pool instead.
    total_savings = sum(int(s["score"] or 0) for s in scores)

    high_risk   = sum(1 for p in premiums if float(p["risk_score"]) >= 0.7)
    medium_risk = sum(1 for p in premiums if 0.4 <= float(p["risk_score"]) < 0.7)
    low_risk    = sum(1 for p in premiums if float(p["risk_score"]) < 0.4)

    return {
        "total_users":        users_res.count or 0,
        "total_policies":     premium_res.count or 0,
        "total_activities":   activity_res.count or 0,
        "avg_risk_score":     avg_risk,
        "total_premium_pool": total_premium,
        "total_savings_given": total_savings,
        "risk_distribution": {
            "high":   high_risk,
            "medium": medium_risk,
            "low":    low_risk,
        }
    }


# ── 2. All users ──────────────────────────────────────────────────────────────
@admin_router.get("/users")
def get_all_users():
    users    = supabase.table("users").select("id, user_name, email, created_at").execute().data or []
    premiums = supabase.table("premium").select(
        "user_id, risk_score, premium_amount, discount_amount, health_risk, lifestyle_risk, driving_risk, policy_plan_id, points"
    ).execute().data or []
    scores   = supabase.table("user_score").select("user_id, score, reward").execute().data or []

    premium_map = {p["user_id"]: p for p in premiums}
    score_map   = {s["user_id"]: s for s in scores}

    result = []
    for u in users:
        uid = u["id"]
        p   = premium_map.get(uid, {})
        s   = score_map.get(uid, {})
        result.append({
            "id":             uid,
            "name":           u.get("user_name", "—"),
            "email":          u.get("email", "—"),
            "joined":         u.get("created_at", ""),
            "risk_score":     float(p.get("risk_score", 0)),
            "premium":        float(p.get("premium_amount", 0)),
            "discount":       float(p.get("discount_amount", 0)),
            "health_risk":    p.get("health_risk", "—"),
            "lifestyle_risk": p.get("lifestyle_risk", "—"),
            "driving_risk":   p.get("driving_risk", "—"),
            "policy_plan":    p.get("policy_plan_id", "—"),
            "points":         int(p.get("points", 0)),
            "activity_score": int(s.get("score", 0)),
            # FIX: reward is a string tier, not an integer — return as-is
            "rupees_saved":   s.get("reward", "—") or "—",
        })

    return result


# ── 3. Risk distribution ──────────────────────────────────────────────────────
@admin_router.get("/risk-distribution")
def risk_distribution():
    premiums = supabase.table("premium").select("health_risk, lifestyle_risk, driving_risk").execute().data or []

    counts = {"low": 0, "medium": 0, "high": 0}
    for p in premiums:
        for field in ["health_risk", "lifestyle_risk", "driving_risk"]:
            val = (p.get(field) or "").lower()
            if val in counts:
                counts[val] += 1

    return [
        {"name": "Low Risk",    "value": counts["low"],    "color": "#4CAF82"},
        {"name": "Medium Risk", "value": counts["medium"], "color": "#E8B84B"},
        {"name": "High Risk",   "value": counts["high"],   "color": "#E05C5C"},
    ]


# ── 4. Premium by plan ────────────────────────────────────────────────────────
@admin_router.get("/premium-by-plan")
def premium_by_plan():
    premiums = supabase.table("premium").select("policy_plan_id, premium_amount, discount_amount").execute().data or []
    plans    = supabase.table("policy_plans").select("id, plan_name").execute().data or []
    plan_map = {p["id"]: p.get("plan_name", f"Plan {p['id']}") for p in plans}

    aggregated = {}
    for p in premiums:
        pid  = p["policy_plan_id"]
        name = plan_map.get(pid, f"Plan {pid}")
        if name not in aggregated:
            aggregated[name] = {"plan": name, "total_premium": 0, "total_discount": 0, "count": 0}
        aggregated[name]["total_premium"]  += float(p["premium_amount"])
        aggregated[name]["total_discount"] += float(p["discount_amount"])
        aggregated[name]["count"]          += 1

    return list(aggregated.values())


# ── 5. Activity trends ────────────────────────────────────────────────────────
@admin_router.get("/activity-trends")
def activity_trends():
    rows = (
        supabase.table("user_activity")
        .select("recorded_at, steps, calories, active_minutes")
        .order("recorded_at", desc=False)
        .limit(200)
        .execute()
        .data or []
    )

    by_date = {}
    for r in rows:
        d = str(r["recorded_at"])[:10]
        if d not in by_date:
            by_date[d] = {"date": d, "avg_steps": [], "avg_calories": [], "avg_active": []}
        by_date[d]["avg_steps"].append(r.get("steps", 0))
        by_date[d]["avg_calories"].append(r.get("calories", 0))
        by_date[d]["avg_active"].append(r.get("active_minutes", 0))

    result = []
    for d, vals in sorted(by_date.items()):
        result.append({
            "date":         d,
            "avg_steps":    round(sum(vals["avg_steps"])    / len(vals["avg_steps"]), 1),
            "avg_calories": round(sum(vals["avg_calories"]) / len(vals["avg_calories"]), 1),
            "avg_active":   round(sum(vals["avg_active"])   / len(vals["avg_active"]), 1),
        })

    return result


# ── 6. Risk factors ───────────────────────────────────────────────────────────
@admin_router.get("/risk-factors")
def risk_factors():
    rows = supabase.table("insurance_risk_inputs").select(
        "smoker, past_accidents, speeding_violations, duis, bmi"
    ).execute().data or []

    if not rows:
        return []

    n = len(rows)
    return [
        {"factor": "Smokers",             "count": sum(1 for r in rows if r.get("smoker")),                         "pct": round(sum(1 for r in rows if r.get("smoker")) / n * 100, 1)},
        {"factor": "Past Accidents",      "count": sum(1 for r in rows if (r.get("past_accidents") or 0) > 0),      "pct": round(sum(1 for r in rows if (r.get("past_accidents") or 0) > 0) / n * 100, 1)},
        {"factor": "Speeding Violations", "count": sum(1 for r in rows if (r.get("speeding_violations") or 0) > 0), "pct": round(sum(1 for r in rows if (r.get("speeding_violations") or 0) > 0) / n * 100, 1)},
        {"factor": "DUIs",                "count": sum(1 for r in rows if (r.get("duis") or 0) > 0),                "pct": round(sum(1 for r in rows if (r.get("duis") or 0) > 0) / n * 100, 1)},
        {"factor": "High BMI (>30)",      "count": sum(1 for r in rows if (r.get("bmi") or 0) > 30),               "pct": round(sum(1 for r in rows if (r.get("bmi") or 0) > 30) / n * 100, 1)},
    ]