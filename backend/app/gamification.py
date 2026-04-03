from datetime import datetime, date
from app.database import supabase


def calculate_score(steps: int, calories: int, active_minutes: int) -> int:
    """
    Scoring formula:
      1 pt per 100 steps
      1 pt per 50 calories
      1 pt per 10 active minutes
    """
    return int(steps / 100 + calories / 50 + active_minutes / 10)


def score_to_rupees(total_score: int) -> int:
    """
    Reward = money saved in rupees.
    Every 100 score points = ₹1 saved.
    e.g. score 129 → ₹1, score 250 → ₹2, score 1050 → ₹10
    """
    return total_score // 100


def record_activity(user_id: int, steps: int, calories: int, active_minutes: int, distance: float):
    today = date.today().isoformat()

    # 1. Insert the raw activity record
    supabase.table("user_activity").insert({
        "user_id": user_id,
        "steps": steps,
        "calories": calories,
        "active_minutes": active_minutes,
        "distance": distance,
        "recorded_at": today
    }).execute()

    # 2. Re-compute the cumulative score by summing ALL activity rows for this user.
    #    This is the source of truth and avoids any read-modify-write race condition.
    all_activities = (
        supabase.table("user_activity")
        .select("steps, calories, active_minutes")
        .eq("user_id", user_id)
        .execute()
    )

    new_total_score = sum(
        calculate_score(
            row["steps"] or 0,
            row["calories"] or 0,
            row["active_minutes"] or 0
        )
        for row in (all_activities.data or [])
    )
    new_reward = score_to_rupees(new_total_score)

    # 3. Upsert the score row (insert if missing, update if exists)
    existing = (
        supabase.table("user_score")
        .select("id")
        .eq("user_id", user_id)
        .execute()
    )

    if existing.data:
        supabase.table("user_score").update({
            "score": new_total_score,
            "reward": new_reward,
            "last_updated": datetime.now().isoformat()
        }).eq("user_id", user_id).execute()
    else:
        supabase.table("user_score").insert({
            "user_id": user_id,
            "score": new_total_score,
            "reward": new_reward,
            "last_updated": datetime.now().isoformat()
        }).execute()

    return {
        "message": "Activity recorded successfully",
        "score": new_total_score,
        "reward": new_reward
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
        "score": score_resp.data[0] if score_resp.data else {"score": 0, "reward": 0}
    }