// mock-server/server.js
const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

// Mock data
const stations = [
  {
    id: "1",
    name: "Lavington Station (Huawei Offices)",
    latitude: -1.2741,
    longitude: 36.7615,
    aqi: 45,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Kilimani Station",
    latitude: -1.2864,
    longitude: 36.7889,
    aqi: 52,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Westlands Station",
    latitude: -1.265,
    longitude: 36.7962,
    aqi: 68,
    lastUpdated: new Date().toISOString(),
  },
];

// API endpoints
app.get("/api/stations", (req, res) => {
  res.json(stations);
});

app.get("/api/stations/:id", (req, res) => {
  const station = stations.find((s) => s.id === req.params.id);
  if (station) {
    res.json(station);
  } else {
    res.status(404).json({ error: "Station not found" });
  }
});

app.get("/api/air-quality/current", (req, res) => {
  const { lat, lng } = req.query;

  // Find nearest station (simplified)
  const nearestStation = stations[0];

  res.json({
    stationId: nearestStation.id,
    timestamp: new Date().toISOString(),
    aqi: nearestStation.aqi,
    pollutants: {
      PM25: 20 + Math.random() * 10,
      PM10: 30 + Math.random() * 15,
      NO2: 0.5 + Math.random() * 0.3,
      CO: 0.04 + Math.random() * 0.02,
      SO2: 0.8 + Math.random() * 0.4,
      O3: 0.05 + Math.random() * 0.02,
    },
    weather: {
      temperature: 22 + Math.random() * 5,
      humidity: 60 + Math.random() * 10,
      windSpeed: 10 + Math.random() * 5,
    },
  });
});

app.get("/api/air-quality/historical", (req, res) => {
  const { stationId, range } = req.query;

  // Generate mock historical data
  const data = [];
  const hours = range === "24h" ? 24 : 7 * 24;

  for (let i = 0; i < hours; i++) {
    const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      aqi: 30 + Math.random() * 40,
      pollutants: {
        PM25: 15 + Math.random() * 20,
        PM10: 25 + Math.random() * 30,
        NO2: 0.4 + Math.random() * 0.4,
        CO: 0.03 + Math.random() * 0.03,
        SO2: 0.6 + Math.random() * 0.6,
        O3: 0.04 + Math.random() * 0.03,
      },
    });
  }

  res.json(data);
});

app.get("/api/health/recommendations", (req, res) => {
  const { aqi } = req.query;
  const aqiValue = parseInt(aqi) || 0;

  let riskLevel = "good";
  if (aqiValue > 300) riskLevel = "hazardous";
  else if (aqiValue > 200) riskLevel = "veryUnhealthy";
  else if (aqiValue > 150) riskLevel = "unhealthy";
  else if (aqiValue > 100) riskLevel = "unhealthySensitive";
  else if (aqiValue > 50) riskLevel = "moderate";

  const healthData = {
    good: {
      level: "Low Risk",
      description:
        "Air quality is considered satisfactory, and air pollution poses little or no risk.",
      recommendations: [
        "Enjoy outdoor activities as usual",
        "Keep windows open for fresh air",
        "Monitor local air quality updates",
      ],
      affectedGroups: ["Generally safe for all groups"],
      alertLevel: "Low",
      alertDescription:
        "Air quality is good and poses little to no health risk.",
      alertColor: "green-500",
    },
    moderate: {
      level: "Moderate Risk",
      description: "Some individuals may experience health effects.",
      recommendations: [
        "Reduce prolonged outdoor activities if you experience symptoms",
        "Keep windows closed during peak pollution hours",
        "Monitor symptoms if you have respiratory conditions",
      ],
      affectedGroups: [
        "Sensitive individuals",
        "People with respiratory conditions",
      ],
      alertLevel: "Moderate",
      alertDescription: "Air quality may pose risks for sensitive groups.",
      alertColor: "yellow-600",
    },
    // ... Add other levels as needed
  };

  res.json({
    current: healthData[riskLevel] || healthData.good,
    risks: Object.values(healthData).slice(0, 3),
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
});

// WebSocket server
const wss = new WebSocket.Server({ port: 8001 });

wss.on("connection", (ws, req) => {
  console.log("WebSocket client connected");

  // Send updates every 5 seconds
  const interval = setInterval(() => {
    const update = {
      timestamp: new Date().toISOString(),
      aqi: 30 + Math.random() * 40,
      pollutants: {
        PM25: 15 + Math.random() * 20,
        PM10: 25 + Math.random() * 30,
        NO2: 0.4 + Math.random() * 0.4,
        CO: 0.03 + Math.random() * 0.03,
        SO2: 0.6 + Math.random() * 0.6,
        O3: 0.04 + Math.random() * 0.03,
      },
    };

    ws.send(JSON.stringify(update));
  }, 5000);

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    clearInterval(interval);
  });
});

console.log("WebSocket server running on ws://localhost:8001");
