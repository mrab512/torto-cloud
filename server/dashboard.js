const express = require("express");
const cors = require("cors");
const path = require("path");
const PocketBase = require("pocketbase/cjs");

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- DB ----------------
const pb = new PocketBase("http://127.0.0.1:8090");

// ---------------- SERVE FRONTEND ----------------
app.use(express.static(path.join(__dirname, "public")));

// ---------------- ROOT ----------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---------------- GET DEVICES ----------------
app.get("/devices", async (req, res) => {
  try {
    const devices = await pb.collection("devices").getFullList({
      sort: "-updated"
    });
    res.json({ items: devices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch devices" });
  }
});

// ---------------- HEARTBEAT ----------------
app.post("/heartbeat", async (req, res) => {
  const { deviceId, cpu, ram, disk } = req.body;

  try {
    const existing = await pb.collection("devices").getList(1, 1, {
      filter: `deviceId="${deviceId}"`
    });

    if (existing.items.length > 0) {
      const id = existing.items[0].id;

      await pb.collection("devices").update(id, {
        cpu: Number(cpu),
        ram: Number(ram),
        disk: Number(disk),
        status: "online",
        lastSeen: new Date().toISOString()
      });

    } else {
      await pb.collection("devices").create({
        deviceId,
        cpu: Number(cpu),
        ram: Number(ram),
        disk: Number(disk),
        status: "online",
        lastSeen: new Date().toISOString()
      });
    }

    // store metrics history
    await pb.collection("metrics").create({
      deviceId,
      cpu: Number(cpu),
      ram: Number(ram),
      disk: Number(disk),
      timestamp: new Date().toISOString()
    });

    res.json({ success: true });

  } catch (err) {
    console.error("Heartbeat error:", err);
    res.status(500).json({ error: "Heartbeat failed" });
  }
});

// ---------------- GET METRICS ----------------
app.get("/metrics/:deviceId", async (req, res) => {
  const { deviceId } = req.params;

  try {
    const metrics = await pb.collection("metrics").getFullList({
      filter: `deviceId="${deviceId}"`,
      sort: "-timestamp"
    });

    res.json({ items: metrics });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

// ---------------- START SERVER ----------------
app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});