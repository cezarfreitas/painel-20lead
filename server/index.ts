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
  trackPageview
} from "./routes/leads";
import {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  getWebhookLogs
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

  app.get("/api/demo", handleDemo);

  // Lead management routes
  app.get("/api/leads", getLeads);
  app.post("/api/leads", createLead);
  app.put("/api/leads/:id", updateLead);
  app.delete("/api/leads/:id", deleteLead);

  // Dashboard routes
  app.get("/api/dashboard/stats", getDashboardStats);

  // Tracking routes
  app.get("/api/tracking/pageview", trackPageview);

  return app;
}
