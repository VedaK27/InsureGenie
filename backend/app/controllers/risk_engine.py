import os
import sys
import pickle
import joblib
import pandas as pd

# =========================================================
# 🔥 FIX PICKLE CLASS MAPPING (VERY IMPORTANT)
# =========================================================

# -------- Lifestyle Model Class --------
class LifestyleRiskModel:
    def __init__(self, low_th, high_th, max_vals):
        self.low_th = low_th
        self.high_th = high_th
        self.max_vals = max_vals

    def predict(self, df):
        df = df.copy()

        df["steps_norm"] = df["TotalSteps"] / self.max_vals["steps"]
        df["calories_norm"] = df["Calories"] / self.max_vals["calories"]
        df["very_active_norm"] = df["VeryActiveMinutes"] / self.max_vals["very_active"]
        df["sedentary_norm"] = 1 - (df["SedentaryMinutes"] / self.max_vals["sedentary"])

        df["lifestyle_score"] = (
            0.35 * df["steps_norm"] +
            0.25 * df["calories_norm"] +
            0.25 * df["very_active_norm"] +
            0.15 * df["sedentary_norm"]
        )

        return df["lifestyle_score"].apply(self._classify).tolist()

    def _classify(self, score):
        if score <= self.low_th:
            return "Low"
        elif score <= self.high_th:
            return "Medium"
        else:
            return "High"


# -------- Dummy Classes for Pickle --------
class DrivingRiskModel:
    pass

class InsuranceRiskModel:
    pass


# -------- MAP CLASSES (CRITICAL 🔥) --------
sys.modules['__main__'].LifestyleRiskModel = LifestyleRiskModel
sys.modules['__main__'].DrivingRiskModel = DrivingRiskModel
sys.modules['__main__'].InsuranceRiskModel = InsuranceRiskModel


# =========================================================
# 📂 LOAD MODELS
# =========================================================

BASE_DIR = os.path.dirname(__file__)

def load_models():
    try:
        with open(os.path.join(BASE_DIR, "models/lifestyle_model.pkl"), "rb") as f:
            lifestyle = pickle.load(f)
    except Exception as e:
        print("❌ Lifestyle model load failed:", e)
        lifestyle = None

    try:
        driving = joblib.load(os.path.join(BASE_DIR, "models/driving_risk_model.pkl"))
    except Exception as e:
        print("❌ Driving model load failed:", e)
        driving = None

    try:
        with open(os.path.join(BASE_DIR, "models/health_model.pkl"), "rb") as f:
            health = pickle.load(f)
    except Exception as e:
        print("❌ Health model load failed:", e)
        health = None

    return lifestyle, driving, health


lifestyle_model, driving_model, health_model = load_models()


# =========================================================
# 🎯 HELPER
# =========================================================

def convert_to_score(label):
    try:
        label = str(label).lower()
        if "low" in label:
            return 0.2
        elif "medium" in label:
            return 0.5
        else:
            return 0.9
    except:
        return 0.5  # fallback


# =========================================================
# 🚀 MAIN FUNCTION
# =========================================================

def calculate_final_risk(data):

    # ---------------- Lifestyle ----------------
    try:
        lifestyle_input = pd.DataFrame({
            "TotalSteps": [data.steps],
            "Calories": [data.calories],
            "VeryActiveMinutes": [data.active_minutes],
            "SedentaryMinutes": [data.sedentary_minutes]
        })

        lifestyle_pred = lifestyle_model.predict(lifestyle_input)[0] if lifestyle_model else "Medium"
    except Exception as e:
        print("⚠️ Lifestyle error:", e)
        lifestyle_pred = "Medium"

    lifestyle_score = convert_to_score(lifestyle_pred)


    # ---------------- Driving ----------------
    try:
        driving_input = [[
            data.age,
            data.male,
            data.driving_exp,
            data.credit_score,
            data.mileage,
            data.vehicle_owner,
            data.vehicle_after_2015,
            data.speeding,
            data.duis,
            data.accidents,
            data.car_type
        ]]

        driving_pred = driving_model.predict(driving_input)[0] if driving_model else "Medium"
    except Exception as e:
        print("⚠️ Driving error:", e)
        driving_pred = "Medium"

    driving_score = convert_to_score(driving_pred)


    # ---------------- Health ----------------
    try:
        health_input = pd.DataFrame({
            "bmi": [data.bmi],
            "heart_rate": [data.heart_rate]
        })

        health_pred = health_model.predict(health_input)[0] if health_model else "Medium"
    except Exception as e:
        print("⚠️ Health error:", e)
        health_pred = "Medium"

    health_score = convert_to_score(health_pred)


    # ---------------- FINAL SCORE ----------------
    final_score = (
        0.5 * health_score +
        0.3 * lifestyle_score +
        0.2 * driving_score
    )


    # ---------------- FINAL LABEL ----------------
    if final_score < 0.4:
        final_label = "Low"
    elif final_score < 0.7:
        final_label = "Medium"
    else:
        final_label = "High"


    return {
        "final_score": round(final_score, 2),
        "final_risk": final_label,
        "breakdown": {
            "health": str(health_pred),
            "lifestyle": str(lifestyle_pred),
            "driving": str(driving_pred)
        }
    }