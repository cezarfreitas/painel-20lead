/**
 * Custom field configuration for webhooks
 */
export interface WebhookField {
  name: string;
  label: string;
  type: "text" | "number" | "boolean" | "email" | "phone" | "url";
  required: boolean;
  defaultValue?: string;
}

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
  customFields?: WebhookField[];
  sendFields?: string[]; // Array of field names to send
}

/**
 * Request body for creating a webhook
 */
export interface CreateWebhookRequest {
  name: string;
  url: string;
  customFields?: WebhookField[];
  sendFields?: string[];
}

/**
 * Request body for updating a webhook
 */
export interface UpdateWebhookRequest {
  name?: string;
  url?: string;
  isActive?: boolean;
  customFields?: WebhookField[];
  sendFields?: string[];
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
