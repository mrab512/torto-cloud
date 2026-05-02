const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

let devices = {};

app.post('/register', (req, res) => {
    const { deviceId } = req.body;

    if (!devices[deviceId]) {
        devices[deviceId] = {
            status: "online",
            lastSeen: new Date(),
            metrics: { cpu: 0, ram: 0, disk: 0 }
        };
    }

    res.send({ success: true });
});

app.post('/heartbeat', (req, res) => {
    const { deviceId, metrics } = req.body;

    if (!devices[deviceId]) devices[deviceId] = {};

    devices[deviceId].status = "online";
    devices[deviceId].lastSeen = new Date();
    devices[deviceId].metrics = metrics;

    res.send({ success: true });
});

app.get('/devices', (req, res) => {
    const now = new Date();

    for (let id in devices) {
        const lastSeen = new Date(devices[id].lastSeen);

        if ((now - lastSeen) > 10000) {
            devices[id].status = "offline";
        }
    }

    res.json(devices);
});

app.post('/delete', (req, res) => {
    const { deviceId } = req.body;
    delete devices[deviceId];
    res.send({ success: true });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});