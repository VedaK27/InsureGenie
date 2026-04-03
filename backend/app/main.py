from fastapi import FastAPI
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
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.controllers.reverse_underwriting import get_reverse_underwriting_advice
from app.database import supabase
from datetime import datetime
from dateutil.relativedelta import relativedelta
from app.schemas.schemas import User
from app.controllers.risk_engine import calculate_final_risk
from app.auth import verify_google_token, create_or_get_user
from app.gamification import record_activity, get_user_dashboard  
import os



app = FastAPI()

app.include_router(chatbot_router, prefix="/bot", tags=["chatbot"])

# ── Pydantic models ──────────────────────────────────────────────────────────
class PointsUpdate(BaseModel):
    points: int

class ReverseUnderwriteRequest(BaseModel):
    user_id: int
    target_plan_level: int

class ActivityInput(BaseModel):
    user_id: int
    steps: int = 0
    calories: int = 0
    active_minutes: int = 0
    distance: float = 0.0

@app.get("/")
def read_root():
    return {"message": "FastAPI backend is running"}


@app.post("/reverse-underwrite")
def reverse_underwrite(data: ReverseUnderwriteRequest):
    return get_reverse_underwriting_advice(data.user_id, data.target_plan_level)


router = APIRouter()

class PredictRequest(User):
    user_id: int   # 👈 ADD THIS

@router.post("/predict-policy")
def predict_policy(
    data: PredictRequest,
    db: Session = Depends(get_db)
):
    try:
        print("Incoming:", data.dict())

        user_id = data.user_id   # 👈 direct use

        save_insurance_input(db=db, user_id=user_id, data=data)

        risk_result = calculate_final_risk(data)
        print (risk_result) 
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


@app.get("/test-db")
def test_db():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "success",
            "message": "Database connection successful"
        }

    except SQLAlchemyError as e:
        return {
            "status": "error",
            "message": "Database connection failed",
            "details": str(e)
        }
    
# CORS for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    # 1. Fetch user name
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

    # 2. Fetch the latest premium row for this user
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

    # 3. Fetch plan name and cost
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

    # 4. Fetch wellness score & reward from user_score
    score_resp = (
        supabase.table("user_score")
        .select("score, reward")
        .eq("user_id", user_id)
        .execute()
    )

    wellness = score_resp.data[0] if score_resp.data else {"score": 0, "reward": 0}

    # 5. Next renewal = created_at + 1 month
    created_at = datetime.fromisoformat(premium["created_at"])
    next_renewal = created_at + relativedelta(months=1)

    # 6. Risk score → label
    risk_level = risk_score_to_level(premium["risk_score"])

    return {
        "user_name":         user_name,
        "plan_name":         plan["name"],
        "monthly_premium":   f"₹{plan['cost']}/month",
        "next_renewal":      next_renewal.strftime("%b %d, %Y"),
        "risk_score":        round(premium["risk_score"], 2),
        "risk_level":        risk_level,
        "wellness_points":   wellness["score"],
        "insurance_savings": f"₹{wellness['reward']} saved",
        "health_risk":       premium["health_risk"] ,
        "lifestyle_risk":    premium["lifestyle_risk"],
        "driving_risk":      premium["driving_risk"]
    
    }

app.include_router(router)


# ── Gamification ─────────────────────────────────────────────────────────────

# BUG FIX 1: Was using query params — frontend sends JSON body.
#            Now uses ActivityInput Pydantic model to accept JSON body.
# BUG FIX 2: Removed duplicate /dashboard/{user_id} route (was defined twice,
#            FastAPI only used the first one which had broken inline SQL logic).
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

# ── Add points (kept as-is, only added HTTPException which was missing) ──────
from app.database import supabase  # reuse supabase client

@app.post("/add_points/{user_id}")
def add_points(user_id: int, data: PointsUpdate):
    try:
        score_resp = supabase.table("user_score").select("score").eq("user_id", user_id).execute()
        current_score = score_resp.data[0]["score"] if score_resp.data else 0
        new_score = current_score + data.points

        if new_score >= 500:
            reward = "Gold"
        elif new_score >= 200:
            reward = "Silver"
        elif new_score >= 50:
            reward = "Bronze"
        else:
            reward = None

        supabase.table("user_score").upsert({
            "user_id": user_id,
            "score": new_score,
            "reward": reward,
            "last_updated": datetime.now().isoformat()
        }, on_conflict="user_id").execute()

        return {"score": new_score, "reward": reward}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))