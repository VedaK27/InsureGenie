from fastapi import FastAPI
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.database import engine
from app.schemas.schemas import User
from app.controllers.risk_engine import calculate_final_risk

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "FastAPI backend is running"}


@app.post("/predict")
def predict(data: User):
    result = calculate_final_risk(data)
    return result


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