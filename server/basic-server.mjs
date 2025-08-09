// Basic LeadHub server in pure JavaScript for maximum compatibility
import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 80;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log(`🚀 LeadHub Basic Server starting on port ${port}`);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    port: port,
    service: "LeadHub Basic",
  });
});

// Basic ping
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

// Demo endpoint
app.get("/api/demo", (req, res) => {
  res.json({ message: "LeadHub API is running" });
});

// Mock leads endpoint
app.get("/api/leads", (req, res) => {
  res.json({
    success: true,
    leads: [
      {
        id: "1",
        phone: "+55 11 99999-9999",
        source: "test",
        name: "Test Lead",
        createdAt: new Date().toISOString(),
      },
    ],
    total: 1,
  });
});

// Mock webhooks endpoint
app.get("/api/webhooks", (req, res) => {
  res.json({
    success: true,
    webhooks: [],
  });
});

// 404 for API routes
app.get("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Default route
app.get("*", (req, res) => {
  res.json({
    message: "LeadHub Basic API is running",
    endpoints: {
      health: "/api/health",
      ping: "/api/ping",
      demo: "/api/demo",
      leads: "/api/leads",
      webhooks: "/api/webhooks",
    },
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`✅ LeadHub Basic Server running on port ${port}`);
  console.log(`🔗 Health: http://localhost:${port}/api/health`);
  console.log(`🔗 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down");
  process.exit(0);
});
