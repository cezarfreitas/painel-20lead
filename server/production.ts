import path from "path";
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { createServer } from "./index";
import express from "express";

const app = createServer();
const port = process.env.PORT || 80;

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`🔧 Server starting from: ${__dirname}`);
console.log(`🔧 Current working directory: ${process.cwd()}`);

// Try different possible paths for the SPA build
const possibleSpaPaths = [
  path.join(__dirname, "../spa"),
  path.join(__dirname, "../../dist/spa"),
  path.join(process.cwd(), "dist/spa"),
  path.join(process.cwd(), "client/dist"),
  path.join(process.cwd(), "build")
];

let spaPath: string | null = null;

// Find the SPA directory
for (const testPath of possibleSpaPaths) {
  console.log(`🔍 Checking for SPA at: ${testPath}`);
  if (existsSync(testPath)) {
    spaPath = testPath;
    console.log(`✅ Found SPA at: ${spaPath}`);
    break;
  }
}

if (spaPath) {
  // Serve static files
  console.log(`📁 Serving static files from: ${spaPath}`);
  app.use(express.static(spaPath));

  // Handle React Router - serve index.html for all non-API routes
  app.get("*", (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }

    const indexPath = path.join(spaPath!, "index.html");
    if (existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: "Frontend not available" });
    }
  });
} else {
  console.log("⚠️ No SPA directory found - running in API-only mode");
  
  // Fallback for missing frontend
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }
    
    res.json({ 
      message: "LeadHub API is running in API-only mode", 
      api: "/api",
      health: "/api/health",
      endpoints: {
        leads: "/api/leads",
        webhooks: "/api/webhooks", 
        dashboard: "/api/dashboard/stats"
      },
      timestamp: new Date().toISOString()
    });
  });
}

app.listen(port, () => {
  console.log(`🚀 LeadHub server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
  console.log(`💗 Health: http://localhost:${port}/api/health`);
  
  if (spaPath) {
    console.log(`📁 Static files: ${spaPath}`);
  } else {
    console.log(`⚠️ Running in API-only mode (no frontend)`);
  }
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
