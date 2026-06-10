const DEVICE_TOKEN = "cmoyrt8ty0035csl2p6fd0txy";
const API_URL = "http://localhost:3000";

console.log("🚀 NynePulse device simulator started...");

setInterval(async () => {
  const payload = {
    temp: +(20 + Math.random() * 30).toFixed(1),
    humidity: +(40 + Math.random() * 40).toFixed(1),
    voltage: +(210 + Math.random() * 20).toFixed(1),
  };

  try {
    await fetch(`${API_URL}/telemetry`, {
      method: "POST",
      body: JSON.stringify({ payload }), // ← wrap in object, stringify
      headers: {
        Authorization: `Bearer ${DEVICE_TOKEN}`,
        "Content-Type": "application/json", // ← required
      },
    });
    console.log("📡 Published:", payload);
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
}, 3000);
