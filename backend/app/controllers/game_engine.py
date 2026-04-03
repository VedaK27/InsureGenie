def calculate_rewards(steps, current_streak=0):
    points = 0
    streak = current_streak

    if steps >= 5000:
        points += 20
        streak += 1
    else:
        streak = 0

    if steps >= 8000:
        points += 10

    if steps >= 10000:
        points += 20

    return {
        "points": points,
        "streak": streak
    }