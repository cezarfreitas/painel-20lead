import { RequestHandler } from "express";
import {
  Lead,
  CreateLeadRequest,
  CreateLeadResponse,
  GetLeadsResponse,
  GetLeadsQuery,
  UpdateLeadRequest,
  UpdateLeadResponse,
  DashboardStatsResponse,
} from "@shared/api";
import { triggerWebhooks } from "./webhooks";
import { LeadDB } from "../database";

let nextId = 4;

/**
 * GET /api/leads - Get all leads with optional filtering
 */
export const getLeads: RequestHandler = async (req, res) => {
  try {
    const query = req.query as GetLeadsQuery;
    const page = parseInt(query.page?.toString() || "1");
    const limit = parseInt(query.limit?.toString() || "10");

    const { leads, total } = await LeadDB.getAll({
      search: query.search,
      page,
      limit,
    });

    // Convert database format to API format
    const formattedLeads = (leads as any[]).map((lead: any) => ({
      id: lead.id,
      phone: lead.phone,
      source: lead.source,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      message: lead.message,
      status: lead.status,
      priority: lead.priority,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
      tags: lead.tags
        ? (() => {
            try {
              return JSON.parse(lead.tags);
            } catch (e) {
              console.error(
                "Error parsing tags for lead",
                lead.id,
                ":",
                lead.tags,
                e,
              );
              return [];
            }
          })()
        : [],
    }));

    const response: GetLeadsResponse = {
      success: true,
      leads: formattedLeads,
      total,
      page,
      limit,
    };

    res.json(response);
  } catch (error) {
    console.error("Error getting leads:", error);
    res.status(500).json({
      success: false,
      leads: [],
      total: 0,
      page: 1,
      limit: 10,
    });
  }
};

/**
 * POST /api/leads - Create a new lead
 */
export const createLead: RequestHandler = async (req, res) => {
  try {
    const leadData = req.body as CreateLeadRequest;

    // Validate required fields
    if (!leadData.phone || !leadData.source) {
      const response: CreateLeadResponse = {
        success: false,
        error: "WhatsApp e origem são obrigatórios",
      };
      return res.status(400).json(response);
    }

    // Create new lead
    const now = new Date().toISOString();

    // Extract custom data from request body
    const { phone, source, name, email, company, message, tags, customData, ...extraFields } = leadData;

    // Combine customData with any extra fields sent directly in the request
    const allCustomData = {
      ...(customData || {}),
      ...extraFields
    };

    const newLeadData = {
      id: nextId.toString(),
      phone: leadData.phone,
      source: leadData.source,
      name: leadData.name,
      email: leadData.email,
      company: leadData.company,
      message: leadData.message,
      status: "new",
      priority: "medium",
      createdAt: now,
      updatedAt: now,
      tags: leadData.tags || [],
      customData: allCustomData,
    };

    nextId++;
    const dbLead = await LeadDB.create(newLeadData);

    // Convert back to API format
    const newLead: Lead = {
      id: dbLead.id,
      phone: dbLead.phone,
      source: dbLead.source,
      name: dbLead.name,
      email: dbLead.email,
      company: dbLead.company,
      message: dbLead.message,
      status: dbLead.status,
      priority: dbLead.priority,
      createdAt: dbLead.created_at,
      updatedAt: dbLead.updated_at,
      tags: dbLead.tags
        ? (() => {
            try {
              return JSON.parse(dbLead.tags);
            } catch (e) {
              console.error(
                "Error parsing tags for lead",
                dbLead.id,
                ":",
                dbLead.tags,
                e,
              );
              return [];
            }
          })()
        : [],
    };

    // Trigger webhooks asynchronously (don't wait for them)
    console.log(`[LEAD] About to trigger webhooks for lead ${newLead.id}`);
    triggerWebhooks(newLead).catch((error) => {
      console.error("Error triggering webhooks:", error);
    });

    const response: CreateLeadResponse = {
      success: true,
      lead: newLead,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating lead:", error);
    const response: CreateLeadResponse = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

/**
 * PUT /api/leads/:id - Update a lead
 */
export const updateLead: RequestHandler = async (req, res) => {
  try {
    const leadId = req.params.id;
    const updates = req.body as UpdateLeadRequest;

    const existingLead = await LeadDB.getById(leadId);

    if (!existingLead) {
      const response: UpdateLeadResponse = {
        success: false,
        error: "Lead não encontrado",
      };
      return res.status(404).json(response);
    }

    // Convert API updates to database format
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.company !== undefined) dbUpdates.company = updates.company;
    if (updates.message !== undefined) dbUpdates.message = updates.message;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.tags !== undefined)
      dbUpdates.tags = JSON.stringify(updates.tags);

    const dbLead = await LeadDB.update(leadId, dbUpdates);

    // Convert back to API format
    const updatedLead: Lead = {
      id: dbLead.id,
      phone: dbLead.phone,
      source: dbLead.source,
      name: dbLead.name,
      email: dbLead.email,
      company: dbLead.company,
      message: dbLead.message,
      status: dbLead.status,
      priority: dbLead.priority,
      createdAt: dbLead.created_at,
      updatedAt: dbLead.updated_at,
      tags: dbLead.tags
        ? (() => {
            try {
              return JSON.parse(dbLead.tags);
            } catch (e) {
              console.error(
                "Error parsing tags for lead",
                dbLead.id,
                ":",
                dbLead.tags,
                e,
              );
              return [];
            }
          })()
        : [],
    };

    const response: UpdateLeadResponse = {
      success: true,
      lead: updatedLead,
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating lead:", error);
    const response: UpdateLeadResponse = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

/**
 * DELETE /api/leads/:id - Delete a lead
 */
export const deleteLead: RequestHandler = async (req, res) => {
  try {
    const leadId = req.params.id;

    const existingLead = await LeadDB.getById(leadId);

    if (!existingLead) {
      return res.status(404).json({
        success: false,
        error: "Lead não encontrado",
      });
    }

    await LeadDB.delete(leadId);

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
};

/**
 * POST /api/leads/:id/resend-webhook - Resend webhooks for a specific lead
 */
export const resendWebhookForLead: RequestHandler = async (req, res) => {
  try {
    const leadId = req.params.id;

    const dbLead = await LeadDB.getById(leadId);

    if (!dbLead) {
      return res.status(404).json({
        success: false,
        error: "Lead não encontrado",
      });
    }

    // Convert to API format
    const lead: Lead = {
      id: dbLead.id,
      phone: dbLead.phone,
      source: dbLead.source,
      name: dbLead.name,
      email: dbLead.email,
      company: dbLead.company,
      message: dbLead.message,
      status: dbLead.status,
      priority: dbLead.priority,
      createdAt: dbLead.created_at,
      updatedAt: dbLead.updated_at,
      tags: dbLead.tags
        ? (() => {
            try {
              return JSON.parse(dbLead.tags);
            } catch (e) {
              console.error(
                "Error parsing tags for lead",
                dbLead.id,
                ":",
                dbLead.tags,
                e,
              );
              return [];
            }
          })()
        : [],
    };

    // Trigger webhooks for this specific lead
    await triggerWebhooks(lead);

    res.json({
      success: true,
      message: "Webhooks reenviados com sucesso",
    });
  } catch (error) {
    console.error("Error resending webhooks:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
};

/**
 * GET /api/dashboard/stats - Get dashboard statistics
 */
export const getDashboardStats: RequestHandler = async (req, res) => {
  try {
    const { leads } = await LeadDB.getAll({}); // Get all for stats

    const leadsArray = leads as any[];
    const totalLeads = leadsArray.length;
    const newLeads = leadsArray.filter(
      (lead: any) => lead.status === "new",
    ).length;
    const convertedLeads = leadsArray.filter(
      (lead: any) => lead.status === "converted",
    ).length;

    const leadsByStatus = leadsArray.reduce(
      (acc: any, lead: any) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      },
      {} as Record<Lead["status"], number>,
    );

    const leadsBySource = leadsArray.reduce(
      (acc: any, lead: any) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Get 5 most recent leads and convert to API format
    const recentDbLeads = leadsArray
      .sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 5);

    const recentLeads = recentDbLeads.map((lead: any) => ({
      id: lead.id,
      phone: lead.phone,
      source: lead.source,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      message: lead.message,
      status: lead.status,
      priority: lead.priority,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
      tags: lead.tags
        ? (() => {
            try {
              return JSON.parse(lead.tags);
            } catch (e) {
              console.error(
                "Error parsing tags for lead",
                lead.id,
                ":",
                lead.tags,
                e,
              );
              return [];
            }
          })()
        : [],
    }));

    const response: DashboardStatsResponse = {
      totalLeads,
      newLeads,
      convertedLeads,
      leadsByStatus,
      leadsBySource,
      recentLeads,
    };

    res.json(response);
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({
      totalLeads: 0,
      newLeads: 0,
      convertedLeads: 0,
      leadsByStatus: {},
      leadsBySource: {},
      recentLeads: [],
    });
  }
};
