import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

let devices = {};

// REGISTER
app.post('/register', (req, res) => {
    const { deviceId } = req.body;

    devices[deviceId] = {
        deviceId,
        status: 'online',
        lastSeen: new Date(),
        metrics: { cpu: 0, ram: 0, disk: 0 }
    };

    console.log("✅ Registered:", deviceId);
    res.json({ success: true });
});

// HEARTBEAT
app.post('/heartbeat', (req, res) => {
    const { deviceId, metrics } = req.body;

    if (!devices[deviceId]) {
        return res.status(404).json({ error: "Device not registered" });
    }

    devices[deviceId].metrics = metrics;
    devices[deviceId].lastSeen = new Date();

    console.log("🔥 Heartbeat:", deviceId, metrics);
    res.json({ success: true });
});

// DELETE DEVICE
app.post('/delete', (req, res) => {
    const { deviceId } = req.body;
    delete devices[deviceId];
    console.log("🗑 Deleted:", deviceId);
    res.json({ success: true });
});

// GET DEVICES (IMPORTANT FORMAT FOR YOUR UI)
app.get('/devices', (req, res) => {
    res.json(devices);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});