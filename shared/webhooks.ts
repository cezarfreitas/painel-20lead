/**
 * Webhook data structure
 */
export interface Webhook {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
}

/**
 * Request body for creating a webhook
 */
export interface CreateWebhookRequest {
  name: string;
  url: string;
}

/**
 * Request body for updating a webhook
 */
export interface UpdateWebhookRequest {
  name?: string;
  url?: string;
  isActive?: boolean;
}

/**
 * Response for webhook operations
 */
export interface WebhookResponse {
  success: boolean;
  webhook?: Webhook;
  error?: string;
}

/**
 * Response for getting webhooks list
 */
export interface GetWebhooksResponse {
  success: boolean;
  webhooks: Webhook[];
}

/**
 * Webhook delivery log
 */
export interface WebhookLog {
  id: string;
  webhookId: string;
  leadId: string;
  url: string;
  status: "success" | "failed" | "retrying";
  httpStatus?: number;
  response?: string;
  error?: string;
  attempt: number;
  maxAttempts: number;
  createdAt: string;
  nextRetry?: string;
}

/**
 * Payload sent to webhook endpoints when a lead is received
 */
export interface WebhookPayload {
  event: "lead.created";
  timestamp: string;
  data: {
    leadId: string;
    phone: string;
    source: string;
    name?: string;
    company?: string;
    message?: string;
    createdAt: string;
  };
}
