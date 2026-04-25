import requests
import time
import psutil
import socket

SERVER_URL = "http://192.168.X.X:3000"  # YOUR SERVER IP

device_id = socket.gethostname()

# Register once
try:
    requests.post(f"{SERVER_URL}/register", json={"deviceId": device_id})
except:
    print("Server not reachable")

def get_metrics():
    return {
        "cpu": psutil.cpu_percent(),
        "ram": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage('/').percent
    }

while True:
    try:
        metrics = get_metrics()

        requests.post(
            f"{SERVER_URL}/heartbeat",
            json={
                "deviceId": device_id,
                "metrics": metrics
            }
        )

        print("Heartbeat:", metrics)

    except Exception as e:
        print("Error:", e)

    time.sleep(5)