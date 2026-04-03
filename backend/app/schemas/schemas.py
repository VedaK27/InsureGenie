from pydantic import BaseModel

class User(BaseModel):

    # Lifestyle
    steps: int
    calories: int
    active_minutes: int
    sedentary_minutes: int

    # Driving
    age: int
    male: int
    driving_exp: int
    credit_score: int
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