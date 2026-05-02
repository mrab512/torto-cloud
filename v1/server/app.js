import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// OPTIONAL: if you created an admin user
// await pb.admins.authWithPassword('email', 'password');

async function testInsert() {
    try {
        const data = {
            deviceId: "device_001",
            status: "online",
            cpu: Math.floor(Math.random() * 100),
            ram: Math.floor(Math.random() * 100),
            disk: Math.floor(Math.random() * 100),
            lastSeen: new Date().toISOString()
        };

        const record = await pb.collection('devices').create(data);
        console.log("✅ Data inserted:", record);

    } catch (err) {
        console.log("❌ Error:", err);
    }
}

testInsert();