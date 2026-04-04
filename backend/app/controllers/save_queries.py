from app.schemas.schemas import User
from sqlalchemy import text 


# -----------------------------
# SAVE INSURANCE INPUT
# -----------------------------
def save_insurance_input(
    db,
    user_id: int,
    data: User
):

    query = text("""
    INSERT INTO insurance_risk_inputs (
        user_id,
        age,
        male,
        driving_experience,
        credit_score,
        annual_mileage,
        vehicle_ownership,
        vehicle_after_2015,
        speeding_violations,
        duis,
        past_accidents,
        car_type_sedan,
        steps,
        calories,
        very_active,
        sedentary,
        bmi
    )
    VALUES (
        :user_id,
        :age,
        :male,
        :driving_exp,
        :credit_score,
        :mileage,
        :vehicle_owner,
        :vehicle_after_2015,
        :speeding,
        :duis,
        :accidents,
        :car_type,
        :steps,
        :calories,
        :active_minutes,
        :sedentary_minutes,
        :bmi
    )
    """)

    db.execute(query, {
    "user_id": user_id,
    "age": data.age,

    "male": data.male,

  # ✅ HARD FIX

    "driving_exp": data.driving_exp,
    "credit_score": data.credit_score,
    "mileage": data.mileage,

   "vehicle_owner": data.vehicle_owner,
"vehicle_after_2015": data.vehicle_after_2015,

    "speeding": data.speeding,
    "duis": data.duis,
    "accidents": data.accidents,

    "car_type": data.car_type,   # ✅

    "steps": data.steps,
    "calories": data.calories,
    "active_minutes": data.active_minutes,
    "sedentary_minutes": data.sedentary_minutes,
    "bmi": data.bmi
})

    db.commit()


# -----------------------------
# SAVE PREMIUM
# -----------------------------
def save_premium(
    db,
    user_id: int,
    policy_plan_id: int,
    risk_score: float,
    premium: int,
    discount: int,
    breakdown: dict,
    health_score: float = 0.0,
    lifestyle_score: float = 0.0,
    driving_score: float = 0.0
):

    query = text("""
    INSERT INTO premium (
        user_id,
        policy_plan_id,
        risk_score,
        premium_amount,
        discount_amount,
        points,
        health_risk,
        lifestyle_risk,
        driving_risk
       
    )
    VALUES (
        :user_id,
        :policy_plan_id,
        :risk_score,
        :premium_amount,
        :discount_amount,
        :points,
        :health_risk,
        :lifestyle_risk,
        :driving_risk
        
    )
    """)

    # ✅ Calculate points from risk_score
    points = int((1 - risk_score) * 100)

    # ✅ Convert numeric sub-scores to categorical labels for DB CHECK constraint
    def _to_label(score):
        if score <= 0.35:
            return "low"
        elif score <= 0.65:
            return "medium"
        else:
            return "high"

    # ✅ THEN execute
    db.execute(query, {
        "user_id": user_id,
        "policy_plan_id": policy_plan_id,
        "risk_score": risk_score,
        "premium_amount": premium,
        "discount_amount": discount,
        "points": points,
        "health_risk": _to_label(health_score),
        "lifestyle_risk": _to_label(lifestyle_score),
        "driving_risk": _to_label(driving_score)
        
    })

    db.commit()