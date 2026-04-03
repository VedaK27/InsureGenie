from fastapi import FastAPI
from app.schemas.user import UserData
from app.risk_engine import calculate_final_risk

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "FastAPI backend is running"}


@app.post("/predict")
def predict(data: UserData):
    result = calculate_final_risk(data)
    return result