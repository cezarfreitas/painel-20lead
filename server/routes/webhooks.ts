import { RequestHandler } from "express";
import {
  Webhook,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  WebhookResponse,
  GetWebhooksResponse,
  WebhookPayload,
  WebhookLog,
} from "@shared/webhooks";
import { Lead } from "@shared/api";
import { WebhookDB, WebhookLogDB } from "../database";

let nextWebhookId = 3;
let nextLogId = 1;

/**
 * GET /api/webhooks - Get all webhooks
 */
export const getWebhooks: RequestHandler = async (req, res) => {
  try {
    const dbWebhooks = await WebhookDB.getAll();

    // Convert to API format
    const webhooks = (dbWebhooks as any[]).map((wh: any) => ({
      id: wh.id,
      name: wh.name,
      url: wh.url,
      isActive: wh.is_active === 1 || wh.is_active === true,
      createdAt: wh.created_at,
      updatedAt: wh.updated_at,
      lastTriggered: wh.last_triggered,
      successCount: wh.success_count,
      failureCount: wh.failure_count,
    }));

    const response: GetWebhooksResponse = {
      success: true,
      webhooks: webhooks,
    };
    res.json(response);
  } catch (error) {
    console.error("Error getting webhooks:", error);
    res.status(500).json({
      success: false,
      webhooks: [],
    });
  }
};

/**
 * POST /api/webhooks - Create a new webhook
 */
export const createWebhook: RequestHandler = async (req, res) => {
  try {
    const webhookData = req.body as CreateWebhookRequest;

    // Validate required fields
    if (!webhookData.name || !webhookData.url) {
      const response: WebhookResponse = {
        success: false,
        error: "Nome e URL são obrigatórios",
      };
      return res.status(400).json(response);
    }

    // Validate URL format
    try {
      new URL(webhookData.url);
    } catch {
      const response: WebhookResponse = {
        success: false,
        error: "URL inválida",
      };
      return res.status(400).json(response);
    }

    // Create new webhook
    const now = new Date().toISOString();
    const newWebhookData = {
      id: `wh_${nextWebhookId.toString().padStart(3, "0")}`,
      name: webhookData.name,
      url: webhookData.url,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      successCount: 0,
      failureCount: 0,
    };

    nextWebhookId++;
    const dbWebhook = await WebhookDB.create(newWebhookData);

    // Convert to API format
    const newWebhook: Webhook = {
      id: dbWebhook.id,
      name: dbWebhook.name,
      url: dbWebhook.url,
      isActive: dbWebhook.is_active === 1 || dbWebhook.is_active === true,
      createdAt: dbWebhook.created_at,
      updatedAt: dbWebhook.updated_at,
      lastTriggered: dbWebhook.last_triggered,
      successCount: dbWebhook.success_count,
      failureCount: dbWebhook.failure_count,
    };

    const response: WebhookResponse = {
      success: true,
      webhook: newWebhook,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating webhook:", error);
    const response: WebhookResponse = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

/**
 * PUT /api/webhooks/:id - Update a webhook
 */
export const updateWebhook: RequestHandler = async (req, res) => {
  try {
    const webhookId = req.params.id;
    const updates = req.body as UpdateWebhookRequest;

    const existingWebhook = await WebhookDB.getById(webhookId);

    if (!existingWebhook) {
      const response: WebhookResponse = {
        success: false,
        error: "Webhook não encontrado",
      };
      return res.status(404).json(response);
    }

    // Validate URL if provided
    if (updates.url) {
      try {
        new URL(updates.url);
      } catch {
        const response: WebhookResponse = {
          success: false,
          error: "URL inválida",
        };
        return res.status(400).json(response);
      }
    }

    // Update webhook
    const dbWebhook = await WebhookDB.update(webhookId, updates);

    // Convert to API format
    const updatedWebhook: Webhook = {
      id: dbWebhook.id,
      name: dbWebhook.name,
      url: dbWebhook.url,
      isActive: dbWebhook.is_active === 1,
      createdAt: dbWebhook.created_at,
      updatedAt: dbWebhook.updated_at,
      lastTriggered: dbWebhook.last_triggered,
      successCount: dbWebhook.success_count,
      failureCount: dbWebhook.failure_count,
    };

    const response: WebhookResponse = {
      success: true,
      webhook: updatedWebhook,
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating webhook:", error);
    const response: WebhookResponse = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

/**
 * DELETE /api/webhooks/:id - Delete a webhook
 */
export const deleteWebhook: RequestHandler = async (req, res) => {
  try {
    const webhookId = req.params.id;

    const existingWebhook = await WebhookDB.getById(webhookId);

    if (!existingWebhook) {
      return res.status(404).json({
        success: false,
        error: "Webhook não encontrado",
      });
    }

    await WebhookDB.delete(webhookId);

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
};

/**
 * Function to trigger webhooks when a lead is created
 */
export const triggerWebhooks = async (lead: Lead): Promise<void> => {
  console.log(`[WEBHOOK] Starting webhook trigger for lead ${lead.id}`);
  const dbWebhooks = await WebhookDB.getActive();
  console.log(
    `[WEBHOOK] Found ${dbWebhooks.length} active webhooks in database`,
  );

  if (dbWebhooks.length === 0) {
    console.log("No active webhooks to trigger");
    return;
  }

  // Convert to API format
  const activeWebhooks = (dbWebhooks as any[]).map((wh: any) => ({
    id: wh.id,
    name: wh.name,
    url: wh.url,
    isActive: wh.is_active === 1 || wh.is_active === true,
    createdAt: wh.created_at,
    updatedAt: wh.updated_at,
    lastTriggered: wh.last_triggered,
    successCount: wh.success_count,
    failureCount: wh.failure_count,
  }));

  console.log(
    `Triggering ${activeWebhooks.length} webhooks for lead ${lead.id}`,
  );

  // Trigger all webhooks in parallel with custom payloads
  const promises = activeWebhooks.map((webhook) => {
    // Create dynamic payload based on webhook configuration
    const baseData = {
      leadId: lead.id,
      phone: lead.phone,
      source: lead.source,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      message: lead.message,
      status: lead.status,
      priority: lead.priority,
      tags: lead.tags,
      createdAt: lead.createdAt,
      ...lead.customData, // Include all custom data
    };

    // Filter data based on webhook's sendFields configuration
    let filteredData = baseData;
    if (webhook.sendFields && webhook.sendFields.length > 0) {
      filteredData = {};
      webhook.sendFields.forEach(fieldName => {
        if (baseData.hasOwnProperty(fieldName)) {
          filteredData[fieldName] = baseData[fieldName];
        }
      });
      // Always include leadId for tracking
      filteredData.leadId = lead.id;
    }

    const payload: WebhookPayload = {
      event: "lead.created",
      timestamp: new Date().toISOString(),
      data: filteredData,
    };

    return triggerSingleWebhook(webhook, payload, lead.id);
  });

  await Promise.allSettled(promises);
};

/**
 * Function to trigger a single webhook
 */
const triggerSingleWebhook = async (
  webhook: Webhook,
  payload: WebhookPayload,
  leadId: string,
  attempt: number = 1,
  maxAttempts: number = 3,
): Promise<void> => {
  const logId = `log_${nextLogId++}`;

  try {
    console.log(
      `Triggering webhook ${webhook.id} (${webhook.url}) - Attempt ${attempt}`,
    );

    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "LeadHub-Webhook/1.0",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const responseText = await response.text();

    if (response.ok) {
      // Success
      await WebhookDB.incrementSuccess(webhook.id);

      const log: WebhookLog = {
        id: logId,
        webhookId: webhook.id,
        leadId,
        url: webhook.url,
        status: "success",
        httpStatus: response.status,
        response: responseText.substring(0, 500), // Limit response size
        attempt,
        maxAttempts,
        createdAt: new Date().toISOString(),
      };

      await WebhookLogDB.create(log);

      console.log(`Webhook ${webhook.id} triggered successfully`);
    } else {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }
  } catch (error) {
    console.error(`Webhook ${webhook.id} failed (attempt ${attempt}):`, error);

    await WebhookDB.incrementFailure(webhook.id);

    const log: WebhookLog = {
      id: logId,
      webhookId: webhook.id,
      leadId,
      url: webhook.url,
      status: attempt < maxAttempts ? "retrying" : "failed",
      error: error instanceof Error ? error.message : String(error),
      attempt,
      maxAttempts,
      createdAt: new Date().toISOString(),
    };

    if (attempt < maxAttempts) {
      // Schedule retry
      const retryDelay = Math.pow(2, attempt) * 1000; // Exponential backoff
      log.nextRetry = new Date(Date.now() + retryDelay).toISOString();

      setTimeout(() => {
        triggerSingleWebhook(
          webhook,
          payload,
          leadId,
          attempt + 1,
          maxAttempts,
        );
      }, retryDelay);
    }

    await WebhookLogDB.create(log);
  }
};

/**
 * GET /api/webhooks/logs - Get webhook delivery logs
 */
export const getWebhookLogs: RequestHandler = async (req, res) => {
  try {
    const logs = await WebhookLogDB.getRecent(100);

    res.json({
      success: true,
      logs: logs,
    });
  } catch (error) {
    console.error("Error getting webhook logs:", error);
    res.status(500).json({
      success: false,
      logs: [],
    });
  }
};
