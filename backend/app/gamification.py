from datetime import datetime, date
from app.database import supabase  # ← use the already-initialized client, don't create a new one


def calculate_score_reward(steps: int, calories: int, active_minutes: int):
    score = int(steps / 100 + calories / 50 + active_minutes / 10)
    if score >= 500:
        reward = "Gold"
    elif score >= 200:
        reward = "Silver"
    elif score >= 1:
        reward = "Bronze"
    else:
        reward = None
    return score, reward


def record_activity(user_id: int, steps: int, calories: int, active_minutes: int, distance: float):
    today = date.today().isoformat()

    # Insert activity row
    supabase.table("user_activity").insert({
        "user_id": user_id,
        "steps": steps,
        "calories": calories,
        "active_minutes": active_minutes,
        "distance": distance,
        "recorded_at": today
    }).execute()

    # Calculate score & reward for this session
    score, reward = calculate_score_reward(steps, calories, active_minutes)

    # Check if a score row already exists for this user
    existing = supabase.table("user_score").select("id, score").eq("user_id", user_id).execute()

    if existing.data:
        # Accumulate score on top of existing
        new_score = existing.data[0]["score"] + score
        if new_score >= 500:
            new_reward = "Gold"
        elif new_score >= 200:
            new_reward = "Silver"
        elif new_score >= 1:
            new_reward = "Bronze"
        else:
            new_reward = None

        supabase.table("user_score").update({
            "score": new_score,
            "reward": new_reward,
            "last_updated": datetime.now().isoformat()
        }).eq("user_id", user_id).execute()

        score, reward = new_score, new_reward
    else:
        # First activity — insert score row
        supabase.table("user_score").insert({
            "user_id": user_id,
            "score": score,
            "reward": reward,
            "last_updated": datetime.now().isoformat()
        }).execute()

    return {
        "message": "Activity recorded successfully",
        "score": score,
        "reward": reward
    }


def get_user_dashboard(user_id: int):
    activity_resp = (
        supabase.table("user_activity")
        .select("steps, calories, active_minutes, distance, recorded_at")
        .eq("user_id", user_id)
        .order("recorded_at", desc=True)
        .limit(10)
        .execute()
    )

    score_resp = (
        supabase.table("user_score")
        .select("score, reward")
        .eq("user_id", user_id)
        .execute()
    )

    return {
        "activity": activity_resp.data or [],
        "score": score_resp.data[0] if score_resp.data else {"score": 0, "reward": None}
    }