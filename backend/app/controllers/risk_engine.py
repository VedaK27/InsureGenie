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
# 🚀 CONTINUOUS NUMERIC SUB-SCORE HELPERS
# =========================================================

def _health_score(bmi: float, heart_rate: int) -> float:
    """Continuous health risk score (0 = healthy, 1 = risky)."""
    # BMI risk: distance from ideal 22, scaled so ±15 from ideal → 1.0
    bmi_risk = min(1.0, abs(bmi - 22.0) / 15.0)
    # Heart-rate risk: distance from ideal 70, scaled so ±50 → 1.0
    hr_risk = min(1.0, abs(heart_rate - 70) / 50.0)
    return bmi_risk * 0.5 + hr_risk * 0.5


def _lifestyle_score(steps: int, calories: int, active_min: int, sedentary_min: int) -> float:
    """Continuous lifestyle risk score (0 = active/healthy, 1 = sedentary/risky)."""
    steps_good     = min(1.0, steps / 10000)
    calories_good  = min(1.0, calories / 2500)
    active_good    = min(1.0, active_min / 60)
    sedentary_bad  = min(1.0, sedentary_min / 960)  # 16 h as ceiling

    # Higher "good" values → lower risk
    score = 1.0 - (
        0.35 * steps_good +
        0.25 * calories_good +
        0.25 * active_good +
        0.15 * (1.0 - sedentary_bad)
    )
    return max(0.0, min(1.0, score))


def _driving_score(speeding: int, accidents: int, driving_exp: int,
                   credit_score: float, duis: int) -> float:
    """Continuous driving risk score (0 = safe, 1 = risky)."""
    speeding_risk  = min(1.0, speeding * 0.15)
    accident_risk  = min(1.0, accidents * 0.25)
    exp_risk       = max(0.0, min(1.0, (15 - driving_exp) / 15.0))
    credit_risk    = max(0.0, min(1.0, (750 - credit_score) / 400.0))
    dui_risk       = min(1.0, duis * 0.35)

    score = (
        0.25 * speeding_risk +
        0.30 * accident_risk +
        0.20 * exp_risk +
        0.15 * credit_risk +
        0.10 * dui_risk
    )
    return max(0.0, min(1.0, score))


# =========================================================
# 🚀 MAIN FUNCTION
# =========================================================

def calculate_final_risk(data):

    # ── Continuous numeric sub-scores from raw inputs ──────────────
    health_numeric   = _health_score(data.bmi, data.heart_rate)
    lifestyle_numeric = _lifestyle_score(
        data.steps, data.calories,
        data.active_minutes, data.sedentary_minutes
    )
    driving_numeric  = _driving_score(
        data.speeding, data.accidents,
        data.driving_exp, data.credit_score, data.duis
    )

    # ── Weighted final score ──────────────────────────────────────
    final_score = (
        0.35 * health_numeric +
        0.30 * lifestyle_numeric +
        0.35 * driving_numeric
    )

    # ── Categorical labels (from ML models, kept for display) ─────
    # Lifestyle
    try:
        lifestyle_input = pd.DataFrame({
            "TotalSteps": [data.steps],
            "Calories": [data.calories],
            "VeryActiveMinutes": [data.active_minutes],
            "SedentaryMinutes": [data.sedentary_minutes]
        })
        lifestyle_pred = lifestyle_model.predict(lifestyle_input)[0] if lifestyle_model else "Medium"
    except Exception as e:
        print("⚠️ Lifestyle model error:", e)
        lifestyle_pred = "Medium"

    # Driving
    try:
        driving_input = [[
            data.age, data.male, data.driving_exp,
            data.credit_score, data.mileage, data.vehicle_owner,
            data.vehicle_after_2015, data.speeding, data.duis,
            data.accidents, data.car_type
        ]]
        driving_pred = driving_model.predict(driving_input)[0] if driving_model else "Medium"
    except Exception as e:
        print("⚠️ Driving model error:", e)
        driving_pred = "Medium"

    # Health
    try:
        health_input = pd.DataFrame({
            "bmi": [data.bmi],
            "heart_rate": [data.heart_rate]
        })
        health_pred = health_model.predict(health_input)[0] if health_model else "Medium"
    except Exception as e:
        print("⚠️ Health model error:", e)
        health_pred = "Medium"

    # ── Final label ───────────────────────────────────────────────
    if final_score < 0.4:
        final_label = "Low"
    elif final_score < 0.7:
        final_label = "Medium"
    else:
        final_label = "High"

    print(f"🔢 Sub-scores → health={health_numeric:.3f}  lifestyle={lifestyle_numeric:.3f}  driving={driving_numeric:.3f}")
    print(f"🔢 Final score = {final_score:.4f}  →  {final_label}")

    return {
        "final_score": round(final_score, 4),
        "final_risk": final_label,
        "health_score": round(health_numeric, 4),
        "lifestyle_score": round(lifestyle_numeric, 4),
        "driving_score": round(driving_numeric, 4),
        "breakdown": {
            "health": str(health_pred),
            "lifestyle": str(lifestyle_pred),
            "driving": str(driving_pred)
        }
    }

def get_policy_plan(risk_score: float):

    if 0 <= risk_score < 0.2:
        return {
            "level": 1,
            "plan": "Elite",
            "premium": 350,
            "discount": -150,
            "label": "Best users"
        }

    elif 0.2 <= risk_score < 0.3:
        return {
            "level": 2,
            "plan": "Pro",
            "premium": 380,
            "discount": -120,
            "label": "Very safe"
        }

    elif 0.3 <= risk_score < 0.45:
        return {
            "level": 3,
            "plan": "Advanced",
            "premium": 420,
            "discount": -80,
            "label": "Slight risk"
        }

    elif 0.45 <= risk_score < 0.6:
        return {
            "level": 4,
            "plan": "Guarded",
            "premium": 450,
            "discount": -50,
            "label": "Moderate"
        }

    elif 0.6 <= risk_score < 0.75:
        return {
            "level": 5,
            "plan": "Risky",
            "premium": 500,
            "discount": 0,
            "label": "Neutral"
        }

    elif 0.75 <= risk_score < 0.9:
        return {
            "level": 6,
            "plan": "Critical",
            "premium": 550,
            "discount": 50,
            "label": "Risk loading"
        }

    elif 0.9 <= risk_score <= 1.0:
        return {
            "level": 7,
            "plan": "Extreme",
            "premium": 650,
            "discount": 150,
            "label": "Very risky"
        }

    else:
        raise ValueError("Invalid risk score")