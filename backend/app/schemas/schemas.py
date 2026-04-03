from pydantic import BaseModel

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
    bmi: float
    heart_rate: int