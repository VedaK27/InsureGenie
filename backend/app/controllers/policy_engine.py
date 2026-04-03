def get_policy_plan(risk_score: float):
    if 0 <= risk_score < 0.2:
        return {
            "level": 1,
            "plan": "Elite 💎",
            "premium": 350,
            "discount": -150,
            "label": "Best users"
        }

    elif 0.2 <= risk_score < 0.3:
        return {
            "level": 2,
            "plan": "Pro 😎",
            "premium": 380,
            "discount": -120,
            "label": "Very safe"
        }

    elif 0.3 <= risk_score < 0.45:
        return {
            "level": 3,
            "plan": "Advanced ⚖️",
            "premium": 420,
            "discount": -80,
            "label": "Slight risk"
        }

    elif 0.45 <= risk_score < 0.6:
        return {
            "level": 4,
            "plan": "Guarded 👀",
            "premium": 450,
            "discount": -50,
            "label": "Moderate"
        }

    elif 0.6 <= risk_score < 0.75:
        return {
            "level": 5,
            "plan": "Risky 🚨",
            "premium": 500,
            "discount": 0,
            "label": "Neutral"
        }

    elif 0.75 <= risk_score < 0.9:
        return {
            "level": 6,
            "plan": "Critical ⚠️",
            "premium": 550,
            "discount": 50,
            "label": "Risk loading"
        }

    elif 0.9 <= risk_score <= 1.0:
        return {
            "level": 7,
            "plan": "Extreme 🔴",
            "premium": 650,
            "discount": 150,
            "label": "Very risky"
        }

    else:
        raise ValueError("Invalid risk score")
