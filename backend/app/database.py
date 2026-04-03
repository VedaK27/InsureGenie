# backend/app/database.py

import os
from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from supabase import create_client

load_dotenv()

# -------------------------
# Supabase (for auth / storage)
# -------------------------

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("URL:", SUPABASE_URL)
print("KEY:", SUPABASE_KEY[:10], "...")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

# -------------------------
# SQLAlchemy (for queries)
# -------------------------

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# -------------------------
# Dependency
# -------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()