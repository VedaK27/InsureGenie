import requests
import time

def get_steps_from_google_fit(access_token):
    url = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # last 24 hours
    end_time = int(time.time() * 1000)
    start_time = end_time - (24 * 60 * 60 * 1000)

    body = {
        "aggregateBy": [{
            "dataTypeName": "com.google.step_count.delta"
        }],
        "bucketByTime": {"durationMillis": 86400000},
        "startTimeMillis": start_time,
        "endTimeMillis": end_time
    }

    response = requests.post(url, json=body, headers=headers)

    if response.status_code != 200:
        print("❌ Google Fit API error:", response.text)
        return 0  # fallback

    data = response.json()

    try:
        steps = 0
        buckets = data.get("bucket", [])

        for bucket in buckets:
            datasets = bucket.get("dataset", [])
            for dataset in datasets:
                points = dataset.get("point", [])
                for point in points:
                    for val in point.get("value", []):
                        steps += int(val.get("intVal", 0))

        return steps

    except Exception as e:
        print("⚠️ Parsing error:", e)
        return 0