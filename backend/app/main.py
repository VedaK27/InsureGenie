from fastapi import FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.database import supabase
from app.schemas.schemas import User
from app.controllers.risk_engine import calculate_final_risk
from fastapi.middleware.cors import CORSMiddleware
from app.auth import verify_google_token, create_or_get_user
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.controllers.save_queries import save_insurance_input, save_premium
from app.controllers.risk_engine import get_policy_plan
from app.database import get_db
from app.auth import get_current_user
from app.controllers.chatbot import router as chatbot_router
from pydantic import BaseModel
from datetime import datetime
from dateutil.relativedelta import relativedelta
from app.gamification import record_activity, get_user_dashboard
import os
from app.admin_routes import admin_router


app = FastAPI()

# ── CORS must be registered BEFORE routers ────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# FIX: admin_router already has prefix="/admin" defined inside admin_routes.py
# DO NOT add prefix="/admin" here again — that would make routes /admin/admin/*

app.include_router(chatbot_router, prefix="/bot", tags=["chatbot"])


# ── Pydantic models ───────────────────────────────────────────────────────────
class PointsUpdate(BaseModel):
    points: int

class ActivityInput(BaseModel):
    user_id: int
    steps: int = 0
    calories: int = 0
    active_minutes: int = 0
    distance: float = 0.0


@app.get("/")
def read_root():
    return {"message": "FastAPI backend is running"}

app.include_router(admin_router)
print(admin_router)  # Debug: Check registered admin routes

router = APIRouter()

class PredictRequest(User):
    user_id: int

@router.post("/predict-policy")
def predict_policy(data: PredictRequest, db: Session = Depends(get_db)):
    try:
        print("Incoming:", data.dict())
        user_id = data.user_id
        save_insurance_input(db=db, user_id=user_id, data=data)
        risk_result = calculate_final_risk(data)
        print(risk_result)
        risk_score = risk_result["final_score"]
        policy = get_policy_plan(risk_score)
        save_premium(
            db=db,
            user_id=user_id,
            policy_plan_id=policy["level"],
            risk_score=risk_score,
            premium=policy["premium"],
            discount=policy["discount"],
            breakdown=risk_result["breakdown"]
        )
        return {
            "success": True,
            "final_score": risk_score,
            "final_risk": risk_result["final_risk"],
            "policy_plan": policy,
            "breakdown": risk_result["breakdown"]
        }
    except Exception as e:
        print("ERROR:", e)
        return {"success": False, "error": str(e)}


@app.post("/auth/google")
def google_auth(data: dict):
    token = data.get("token")
    if not token:
        return {"error": "No token provided"}
    user_info = verify_google_token(token)
    if not user_info:
        return {"error": "Invalid token"}
    user = create_or_get_user(user_info)
    return {"message": "Login successful", "user": user}


def risk_score_to_level(risk_score: float) -> str:
    if risk_score <= 0.20:
        return "Very Low Risk"
    elif risk_score <= 0.40:
        return "Low Risk"
    elif risk_score <= 0.60:
        return "Moderate Risk"
    elif risk_score <= 0.80:
        return "High Risk"
    else:
        return "Very High Risk"


@router.get("/policy-card/{user_id}")
def get_policy_card(user_id: int):
    user_resp = (
        supabase.table("users")
        .select("user_name")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not user_resp.data:
        raise HTTPException(status_code=404, detail="User not found.")
    user_name = user_resp.data["user_name"]

    premium_resp = (
        supabase.table("premium")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not premium_resp.data:
        raise HTTPException(status_code=404, detail="No policy found for this user.")
    premium = premium_resp.data[0]

    plan_resp = (
        supabase.table("policy_plans")
        .select("name, cost")
        .eq("id", premium["policy_plan_id"])
        .single()
        .execute()
    )
    if not plan_resp.data:
        raise HTTPException(status_code=404, detail="Policy plan not found.")
    plan = plan_resp.data

    score_resp = (
        supabase.table("user_score")
        .select("score, reward")
        .eq("user_id", user_id)
        .execute()
    )
    wellness = score_resp.data[0] if score_resp.data else {"score": 0, "reward": 0}

    created_at   = datetime.fromisoformat(premium["created_at"])
    next_renewal = created_at + relativedelta(months=1)
    risk_level   = risk_score_to_level(premium["risk_score"])

    return {
        "user_name":         user_name,
        "plan_name":         plan["name"],
        "monthly_premium":   f"₹{plan['cost']}/month",
        "next_renewal":      next_renewal.strftime("%b %d, %Y"),
        "risk_score":        round(premium["risk_score"], 2),
        "risk_level":        risk_level,
        "wellness_points":   wellness["score"],
        "insurance_savings": f"₹{wellness['reward']} saved",
        "health_risk":       premium["health_risk"],
        "lifestyle_risk":    premium["lifestyle_risk"],
        "driving_risk":      premium["driving_risk"],
    }

app.include_router(router)


# ── Gamification ──────────────────────────────────────────────────────────────
@app.post("/activity")
def add_activity(data: ActivityInput):
    try:
        return record_activity(
            data.user_id,
            data.steps,
            data.calories,
            data.active_minutes,
            data.distance
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/dashboard/{user_id}")
def dashboard(user_id: int):
    try:
        return get_user_dashboard(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/add_points/{user_id}")
def add_points(user_id: int, data: PointsUpdate):
    try:
        score_resp    = supabase.table("user_score").select("score").eq("user_id", user_id).execute()
        current_score = score_resp.data[0]["score"] if score_resp.data else 0
        new_score     = current_score + data.points

        if new_score >= 500:
            reward = "Gold"
        elif new_score >= 200:
            reward = "Silver"
        elif new_score >= 50:
            reward = "Bronze"
        else:
            reward = None

        supabase.table("user_score").upsert({
            "user_id":      user_id,
            "score":        new_score,
            "reward":       reward,
            "last_updated": datetime.now().isoformat()
        }, on_conflict="user_id").execute()

        return {"score": new_score, "reward": reward}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


@admin_router.get("/summary")
def get_summary():
    users_res      = supabase.table("users").select("id", count="exact").execute()
    premium_res    = supabase.table("premium").select("risk_score, premium_amount, discount_amount", count="exact").execute()
    activity_res   = supabase.table("user_activity").select("id", count="exact").execute()
    score_res      = supabase.table("user_score").select("score, reward").execute()

    premiums = premium_res.data or []
    scores   = score_res.data or []

    avg_risk      = round(sum(float(p["risk_score"]) for p in premiums) / len(premiums), 2) if premiums else 0
    total_premium = round(sum(float(p["premium_amount"]) for p in premiums), 2)
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
        "user_id, risk_score, premium_amount, discount_amount, "
        "health_risk, lifestyle_risk, driving_risk, policy_plan_id, points"
    ).execute().data or []
    scores   = supabase.table("user_score").select("user_id, score, reward").execute().data or []

    # FIX: fetch all policy plans and build a map of id -> cost
    # This replaces the flat premium_amount (which was always 500)
    # with the correct cost from policy_plans table
    plans_res = supabase.table("policy_plans").select("id, name, cost").execute().data or []
    plan_cost_map = {p["id"]: float(p["cost"]) for p in plans_res}
    plan_name_map = {p["id"]: p["name"]        for p in plans_res}

    premium_map = {p["user_id"]: p for p in premiums}
    score_map   = {s["user_id"]: s for s in scores}

    result = []
    for u in users:
        uid = u["id"]
        p   = premium_map.get(uid, {})
        s   = score_map.get(uid, {})

        policy_plan_id = p.get("policy_plan_id")

        # FIX: use policy_plans.cost instead of premium.premium_amount
        # Fallback to premium_amount only if policy_plan_id is missing/unmapped
        if policy_plan_id and policy_plan_id in plan_cost_map:
            premium_value  = plan_cost_map[policy_plan_id]
            plan_label     = plan_name_map[policy_plan_id]
        else:
            premium_value  = float(p.get("premium_amount", 0))
            plan_label     = str(policy_plan_id) if policy_plan_id else "—"

        result.append({
            "id":             uid,
            "name":           u.get("user_name", "—"),
            "email":          u.get("email", "—"),
            "joined":         u.get("created_at", ""),
            "risk_score":     float(p.get("risk_score", 0)),
            "premium":        premium_value,          # ← now correctly from policy_plans.cost
            "discount":       float(p.get("discount_amount", 0)),
            "health_risk":    p.get("health_risk", "—"),
            "lifestyle_risk": p.get("lifestyle_risk", "—"),
            "driving_risk":   p.get("driving_risk", "—"),
            "policy_plan":    plan_label,             # ← now shows plan name e.g. "Elite"
            "points":         int(p.get("points", 0)),
            "activity_score": int(s.get("score", 0)),
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

    # FIX: use "name" column (not "plan_name") — matches your DB schema
    plans    = supabase.table("policy_plans").select("id, name, cost").execute().data or []
    plan_map = {p["id"]: p.get("name", f"Plan {p['id']}") for p in plans}

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