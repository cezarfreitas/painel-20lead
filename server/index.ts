import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  getDashboardStats,
  resendWebhookForLead,
} from "./routes/leads";
import {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  getWebhookLogs,
} from "./routes/webhooks";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "LeadHub API"
    });
  });

  // Test webhook endpoint
  app.post("/api/test-webhook", async (_req, res) => {
    const { triggerWebhooks } = await import("./routes/webhooks");

    const testLead = {
      id: "test_" + Date.now(),
      phone: "+55 11 99999-9999",
      source: "test",
      name: "Teste Webhook",
      email: "teste@example.com",
      company: "Test Company",
      message: "Testando webhook",
      status: "new" as const,
      priority: "medium" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ["test"]
    };

    try {
      await triggerWebhooks(testLead);
      res.json({ success: true, message: "Webhook test triggered", testLead });
    } catch (error) {
      console.error("Error in test webhook:", error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/demo", handleDemo);

  // Lead management routes
  app.get("/api/leads", getLeads);
  app.post("/api/leads", createLead);
  app.put("/api/leads/:id", updateLead);
  app.delete("/api/leads/:id", deleteLead);
  app.post("/api/leads/:id/resend-webhook", resendWebhookForLead);

  // Dashboard routes
  app.get("/api/dashboard/stats", getDashboardStats);

  // Webhook routes
  app.get("/api/webhooks", getWebhooks);
  app.post("/api/webhooks", createWebhook);
  app.put("/api/webhooks/:id", updateWebhook);
  app.delete("/api/webhooks/:id", deleteWebhook);
  app.get("/api/webhooks/logs", getWebhookLogs);

  return app;
}
