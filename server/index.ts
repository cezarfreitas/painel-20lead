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
      service: "LeadHub API",
    });
  });

  // Test lead creation endpoint
  app.post("/api/test-lead", async (req, res) => {
    console.log("🧪 [TEST] Received test lead request");
    console.log("🧪 [TEST] Body:", JSON.stringify(req.body, null, 2));

    // Call the actual createLead function
    const { createLead } = await import("./routes/leads");
    return createLead(req, res);
  });

  // Internal test endpoint that simulates the exact request
  app.get("/api/debug-lead", async (req, res) => {
    console.log("🔧 [DEBUG] Simulating exact lead creation");

    const testLead = {
      "name": "cezar",
      "whatsapp": "11989882867",
      "hasCnpj": "nao-consumidor",
      "cnpj": null,
      "marca": "Ecko",
      "origem": "Landing Page Lojistas",
      "campaign_type": "Lead Generation",
      "lead_source": "Website Form",
      "utm_source": null,
      "utm_medium": null,
      "utm_campaign": null,
      "utm_term": null,
      "utm_content": null,
      "referrer": "http://148.230.78.129:3000/",
      "traffic_source": "referral",
      "page_url": "https://ide-ecko-lp.jzo3qo.easypanel.host/",
      "page_title": "Seja Lojista Oficial Ecko - Maior Marca de Streetwear do Brasil",
      "landing_page": "/",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "language": "pt-BR",
      "screen_resolution": "1920x1080",
      "viewport_size": "1350x911",
      "timezone": "America/Sao_Paulo",
      "session_id": "me4jv68xv4begahm3ls",
      "page_load_time": 10551.099999964237,
      "timestamp": "2025-08-09T18:14:56.970Z",
      "local_time": "09/08/2025, 15:14:56",
      "is_mobile": false,
      "is_tablet": false,
      "is_desktop": true,
      "browser": "Chrome",
      "gclid": null,
      "fbclid": null,
      "cookie_consent": null,
      "lead_quality": "medium",
      "lead_type": "consumer",
      "form_completion_time": 10322.700000047684,
      "conversion_page": "/",
      "conversion_element": "main_form",
      "conversion_position": "hero_section",
      "interest_level": "high",
      "engagement_score": 7,
      "form_timestamp": "2025-08-09T18:14:56.971Z",
      "server_timestamp": null
    };

    // Create a mock request object
    const mockReq = { body: testLead } as any;

    try {
      const { createLead } = await import("./routes/leads");
      await createLead(mockReq, res);
    } catch (error) {
      console.error("🔧 [DEBUG] Error in debug endpoint:", error);
      res.status(500).json({ error: "Debug failed", details: error });
    }
  });

  // Test webhook endpoint
  app.post("/api/test-webhook", async (_req, res) => {
    const { triggerWebhooks } = await import("./routes/webhooks");

    const testLead = {
      id: "test_" + Date.now(),
      phone: "+55 11 99999-9999",
      source: "test-api",
      name: "Teste Webhook Completo",
      email: "teste@example.com",
      company: "Test Company",
      message: "Testando webhook com campos personalizados",
      status: "new" as const,
      priority: "high" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ["test", "webhook", "custom-fields"],
      customData: {
        budget: "R$ 10.000",
        interesse: "plano-enterprise",
        agendamento: "2025-08-15 14:00",
        funcionarios: 100,
        website: "https://testcompany.com",
        origem_campanha: "google-ads",
        valor_contrato: 50000,
      },
    };

    try {
      await triggerWebhooks(testLead);
      res.json({
        success: true,
        message: "Webhook test triggered with custom fields",
        testLead,
        note: "Verifique os logs para ver o payload enviado para cada webhook",
      });
    } catch (error) {
      console.error("Error in test webhook:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
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
