import requests
import psutil
import socket
import time

SERVER = "http://localhost:3000"
DEVICE_ID = socket.gethostname()

def get_cpu():
    return psutil.cpu_percent(interval=1)

def get_ram():
    return psutil.virtual_memory().percent

def get_disk():
    return psutil.disk_usage('/').percent

def send_heartbeat():
    data = {
        "deviceId": DEVICE_ID,
        "cpu": get_cpu(),
        "ram": get_ram(),
        "disk": get_disk()
    }

    try:
        response = requests.post(f"{SERVER}/heartbeat", json=data)
        print("Heartbeat sent:", data)
    except Exception as e:
        print("Error sending heartbeat:", e)

while True:
    send_heartbeat()
    time.sleep(5)