from fastapi import FastAPI
from app.schemas.schemas import UserData, PolicyPredictionOutput
from app.controllers.risk_engine import calculate_final_risk
from app.controllers.policy_engine import get_policy_plan

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "FastAPI backend is running"}


@app.post("/predict")
def predict(data: UserData):
    result = calculate_final_risk(data)
    return result

@app.post("/predict-policy", response_model=PolicyPredictionOutput)
def predict_policy(data: UserData):
    risk_result = calculate_final_risk(data)
    policy_plan = get_policy_plan(risk_result["final_score"])
    
    return PolicyPredictionOutput(
        policy_plan=policy_plan,
        final_score=risk_result["final_score"],
        final_risk=risk_result["final_risk"],
        breakdown=risk_result["breakdown"]
    )