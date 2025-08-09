import { createServer } from "./index";

// Simple production server for EasyPanel
const app = createServer();
const port = process.env.PORT || 80;

console.log(`🚀 LeadHub starting on port ${port}`);
console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);

// Health check endpoint (if not already defined)
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    port: port,
    service: "LeadHub",
  });
});

// Basic error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler for non-API routes
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  // Serve a simple message for non-API routes
  res.json({
    message: "LeadHub API is running",
    api: "/api",
    health: "/health",
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`✅ LeadHub server running on port ${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log(`🔗 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
