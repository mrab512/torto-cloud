🐢 Torto Cloud
🚀 Overview
Torto Cloud is a real-time IoT monitoring system that collects device
metrics (CPU, RAM, Disk) using a Python agent, processes them via a
Node.js server, stores them in PocketBase, and visualizes them on a
dashboard.
---
🧠 Basic Architecture
Device (Python Agent) → Node.js Server → PocketBase DB → Dashboard UI →
Cloudflare (Public Access)
---
⚙️ How to Run the System
1️⃣ Run Database (PocketBase)
cd DB pocketbase serve
Open: http://127.0.0.1:8090/_/
---
2️⃣ Run Node Server
cd server npm install node server.js
Server runs on: http://localhost:3000
---
3️⃣ Run Python Agent
cd client pip install requests psutil python agent1.1.py
---
4️⃣ Run Cloudflare Tunnel
cloudflared tunnel login cloudflared tunnel create torto-tunnel
cloudflared tunnel route dns torto-tunnel app.torto.cloud cloudflared
tunnel run torto-tunnel
---
📊 API Endpoints
POST /register  
POST /heartbeat  
GET /devices
---
🧹 Repository Best Practices
What to Keep
server/
client/
DB/
README.md
What to Remove
node_modules/
*.exe
logs
temporary files
---
🔐 .gitignore Setup
Create a file named `.gitignore` and add:
node_modules/ *.exe .env pycache/ *.log
---
🔄 Git Workflow
git add . git commit -m "your update message" git push origin main
---
🌟 Future Improvements
Authentication
Multi-user system
Persistent DB usage
Cloud deployment
Torto OS (Yocto-based)
---
👨‍💻 Author
Torto Labs Pvt Ltd
