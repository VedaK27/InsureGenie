from pydantic import BaseModel, Field

class UserData(BaseModel):
    # Lifestyle
    steps: int
    calories: int
    active_minutes: int
    sedentary_minutes: int

    # Driving
    age: int
    male: int
    driving_exp: int
    credit_score: float
    mileage: int
    vehicle_owner: int
    vehicle_after_2015: int
    speeding: int
    duis: int
    accidents: int
    car_type: int

    # Health
    heart_rate: int

class RiskBreakdown(BaseModel):
    health: str
    lifestyle: str
    driving: str

class PolicyPredictionInput(BaseModel):
    final_score: float = Field(..., ge=0.0, le=1.0)
    final_risk: str
    breakdown: RiskBreakdown

class PolicyPlanDetails(BaseModel):
    level: int
    plan: str
    premium: float
    discount: float
    label: str

class PolicyPredictionOutput(PolicyPredictionInput):
    policy_plan: PolicyPlanDetails