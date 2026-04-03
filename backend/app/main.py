from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import os

from app.schemas.schemas import User
from app.controllers.risk_engine import calculate_final_risk
from app.auth import verify_google_token, create_or_get_user
from app.gamification import record_activity, get_user_dashboard  # ← import these

app = FastAPI()

# ── CORS — must be added before routes ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic models ──────────────────────────────────────────────────────────
class PointsUpdate(BaseModel):
    points: int

class ActivityInput(BaseModel):
    user_id: int
    steps: int = 0
    calories: int = 0
    active_minutes: int = 0
    distance: float = 0.0

# ── Existing endpoints (unchanged) ──────────────────────────────────────────
@app.get("/")
def read_root():
    return {"message": "FastAPI backend is running"}

@app.post("/predict")
def predict(data: User):
    result = calculate_final_risk(data)
    return result

# ── Auth ─────────────────────────────────────────────────────────────────────
@app.post("/auth/google")
def google_auth(data: dict):
    token = data.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="No token provided")

    user_info = verify_google_token(token)
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = create_or_get_user(user_info)
    return {"message": "Login successful", "user": user}

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