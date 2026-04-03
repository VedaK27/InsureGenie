from fastapi import FastAPI
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.database import supabase
from app.schemas.schemas import User
from app.controllers.risk_engine import calculate_final_risk
from fastapi.middleware.cors import CORSMiddleware
from app.auth import verify_google_token, create_or_get_user

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
    
# CORS for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/auth/google")
def google_auth(data: dict):
    token = data.get("token")

    if not token:
        return {"error": "No token provided"}

    user_info = verify_google_token(token)
    if not user_info:
        return {"error": "Invalid token"}

    user = create_or_get_user(user_info)
    return {"message": "Login successful", "user": user}