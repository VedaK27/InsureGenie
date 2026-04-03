# backend/app/database.py
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Debug prints to ensure env loaded correctly
print("URL:", SUPABASE_URL)
print("KEY:", SUPABASE_KEY[:10], "...")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)