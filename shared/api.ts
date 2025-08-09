/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Lead data structure
 */
export interface Lead {
  id: string;
  phone: string; // WhatsApp obrigatório
  source: string; // Origem obrigatória
  name?: string; // Nome opcional
  email?: string; // Email opcional
  company?: string;
  message?: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  tags: string[];
  customData?: Record<string, any>; // For dynamic custom fields
}

/**
 * Request body for creating a new lead
 */
export interface CreateLeadRequest {
  phone: string; // WhatsApp obrigatório
  source: string; // Origem obrigatória
  name?: string; // Nome opcional
  email?: string; // Email opcional
  company?: string;
  message?: string;
  tags?: string[];
  customData?: Record<string, any>; // For dynamic custom fields
  [key: string]: any; // Allow any additional fields
}

/**
 * Response for creating a lead
 */
export interface CreateLeadResponse {
  success: boolean;
  lead?: Lead;
  error?: string;
}

/**
 * Response for getting leads list
 */
export interface GetLeadsResponse {
  success: boolean;
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Request query parameters for getting leads
 */
export interface GetLeadsQuery {
  page?: number;
  limit?: number;
  status?: Lead["status"];
  priority?: Lead["priority"];
  source?: string;
  search?: string;
}

/**
 * Request body for updating a lead
 */
export interface UpdateLeadRequest {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  status?: Lead["status"];
  priority?: Lead["priority"];
  tags?: string[];
}

/**
 * Response for updating a lead
 */
export interface UpdateLeadResponse {
  success: boolean;
  lead?: Lead;
  error?: string;
}

/**
 * Dashboard stats response
 */
export interface DashboardStatsResponse {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  leadsByStatus: Record<Lead["status"], number>;
  leadsBySource: Record<string, number>;
  recentLeads: Lead[];
}
