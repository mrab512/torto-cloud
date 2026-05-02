import requests
import time
import psutil
import uuid
import os

API_KEY = open("apikey.txt").read().strip()

# UNIQUE DEVICE ID
if not os.path.exists("device_id.txt"):
    with open("device_id.txt", "w") as f:
        f.write(str(uuid.uuid4()))

device_id = open("device_id.txt").read().strip()

def get_metrics():
    return {
        "cpu": psutil.cpu_percent(),
        "ram": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage('/').percent
    }

while True:
    try:
        metrics = get_metrics()

        payload = {
            "apiKey": API_KEY,
            "deviceId": device_id,
            "cpu": metrics["cpu"],
            "ram": metrics["ram"],
            "disk": metrics["disk"]
        }

        print("Sending:", payload)

        res = requests.post("http://localhost:3000/heartbeat", json=payload)

        print("Response:", res.json())

    except Exception as e:
        print("Error:", e)

    time.sleep(5)