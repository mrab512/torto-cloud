const express = require("express");
const cors = require("cors");
const path = require("path");

const fetch = global.fetch;

const app = express();
app.use(express.json());
app.use(cors());

const PB_URL = "http://127.0.0.1:8090";

/* SERVE FRONTEND */
app.use(express.static(path.join(__dirname, "../public")));

/* LOGIN */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const response = await fetch(`${PB_URL}/api/collections/users/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identity: email,
      password: password
    })
  });

  const data = await response.json();
  if (!response.ok) return res.status(400).json(data);

  res.json(data);
});

/* GENERATE KEY */
app.post("/generate-key", async (req, res) => {
  const token = req.headers.authorization;

  const apiKey = Math.random().toString(36).substring(2, 18);

  const userRes = await fetch(`${PB_URL}/api/collections/users/records`, {
    headers: { Authorization: token }
  });

  const userData = await userRes.json();
  const user = userData.items[0];

  await fetch(`${PB_URL}/api/collections/users/records/${user.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ apiKey })
  });

  res.json({ apiKey });
});

/* HEARTBEAT */
app.post("/heartbeat", async (req, res) => {
  const { apiKey, cpu, ram, disk, deviceId } = req.body;

  const usersRes = await fetch(`${PB_URL}/api/collections/users/records?filter=apiKey="${apiKey}"`);
  const usersData = await usersRes.json();

  if (usersData.items.length === 0) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  const user = usersData.items[0];

  const devicesRes = await fetch(
    `${PB_URL}/api/collections/devices/records?filter=deviceId="${deviceId}"`
  );
  const devicesData = await devicesRes.json();

  if (devicesData.items.length === 0) {
    await fetch(`${PB_URL}/api/collections/devices/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId,
        status: "online",
        cpu,
        ram,
        disk,
        lastSeen: new Date().toISOString(),
        apiKey,
        userId: user.id
      })
    });
  } else {
    const existing = devicesData.items[0];

    await fetch(`${PB_URL}/api/collections/devices/records/${existing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cpu,
        ram,
        disk,
        status: "online",
        lastSeen: new Date().toISOString()
      })
    });
  }

  /* METRICS HISTORY */
  await fetch(`${PB_URL}/api/collections/metrics/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceId,
      cpu,
      ram,
      disk,
      timestamp: new Date().toISOString()
    })
  });

  res.json({ success: true });
});

/* DEVICES (WITH OFFLINE + ALERT) */
app.get("/devices", async (req, res) => {
  const token = req.headers.authorization;

  const userRes = await fetch(`${PB_URL}/api/collections/users/records`, {
    headers: { Authorization: token }
  });

  const userData = await userRes.json();
  const user = userData.items[0];

  const devicesRes = await fetch(
    `${PB_URL}/api/collections/devices/records?filter=userId="${user.id}"`
  );

  const devicesData = await devicesRes.json();

  const now = new Date();

  const updatedDevices = devicesData.items.map(d => {
    const lastSeen = new Date(d.lastSeen);
    const diff = (now - lastSeen) / 1000;

    let status = diff > 15 ? "offline" : "online";

    let alert = "";

    if (status === "online") {
      if (d.cpu > 2) alert = "⚠ High CPU";
      if (d.ram > 90) alert = "⚠ High RAM";
    }

    return {
      ...d,
      status,
      alert
    };
  });

  res.json(updatedDevices);
});

/* START SERVER */
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});