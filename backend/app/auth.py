# backend/app/auth.py
from google.oauth2 import id_token
from google.auth.transport import requests
from app.database import supabase
import os

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )
        return idinfo
    except Exception as e:
        print("Google token verification failed:", e)
        return None


def create_or_get_user(user_info):
    """Check if user exists, else insert into Supabase"""
    email = user_info["email"]

    res = supabase.table("users").select("*").eq("email", email).execute()

    if res.data:  # User exists
        return res.data[0]

    # User does not exist → create
    new_user = {
        "google_id": user_info["sub"],       # Unique Google ID
        "email": email,
        "user_name": user_info.get("name"),
    }

    insert_res = supabase.table("users").insert(new_user).execute()
    return insert_res.data[0]