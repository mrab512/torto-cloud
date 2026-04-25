import requests
import time
import psutil
import socket

SERVER_URL = "http://localhost:3000"

device_id = socket.gethostname()

def safe_post(url, payload):
    try:
        r = requests.post(url, json=payload, timeout=5)
        return r.status_code, r.text
    except Exception as e:
        return None, str(e)

# REGISTER
while True:
    status, resp = safe_post(f"{SERVER_URL}/register", {"deviceId": device_id})
    if status and 200 <= status < 300:
        print("✅ Registered:", device_id)
        break
    else:
        print("❌ Register failed:", resp)
        time.sleep(3)

def get_metrics():
    return {
        "cpu": psutil.cpu_percent(interval=1),
        "ram": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage('/').percent
    }

# HEARTBEAT LOOP
while True:
    metrics = get_metrics()

    status, resp = safe_post(
        f"{SERVER_URL}/heartbeat",
        {
            "deviceId": device_id,
            "metrics": metrics
        }
    )

    if status and 200 <= status < 300:
        print("🔥 Heartbeat OK:", metrics)
    else:
        print("❌ Heartbeat FAIL:", resp)

    time.sleep(5)