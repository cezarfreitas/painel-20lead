import { RequestHandler } from "express";
import {
  Lead,
  CreateLeadRequest,
  CreateLeadResponse,
  GetLeadsResponse,
  GetLeadsQuery,
  UpdateLeadRequest,
  UpdateLeadResponse,
  DashboardStatsResponse
} from "@shared/api";
import { triggerWebhooks } from "./webhooks";

// In-memory storage for leads (in production, use a real database)
let leads: Lead[] = [
  {
    id: "1",
    phone: "+55 11 99999-9999",
    source: "landing-page-produtos",
    name: "João Silva",
    company: "Tech Solutions Ltd",
    message: "Interessado em saber mais sobre os serviços",
    status: "new",
    priority: "high",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["produto", "premium"]
  },
  {
    id: "2",
    phone: "+55 21 88888-8888",
    source: "formulario-contato",
    name: "Maria Santos",
    company: "Inovação & Co",
    message: "Gostaria de agendar uma demonstração",
    status: "contacted",
    priority: "medium",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    tags: ["demo", "empresarial"]
  },
  {
    id: "3",
    phone: "+55 11 99999-9999",
    source: "webinar-growth",
    name: "Pedro Costa",
    company: "StartupXYZ",
    message: "Preciso de uma solução escalável",
    status: "qualified",
    priority: "high",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    tags: ["startup", "growth"]
  }
];

let nextId = 4;

/**
 * GET /api/leads - Get all leads with optional filtering
 */
export const getLeads: RequestHandler = (req, res) => {
  try {
    const query = req.query as GetLeadsQuery;
    const page = parseInt(query.page?.toString() || "1");
    const limit = parseInt(query.limit?.toString() || "10");
    
    let filteredLeads = [...leads];
    
    // Apply filters
    if (query.status) {
      filteredLeads = filteredLeads.filter(lead => lead.status === query.status);
    }
    
    if (query.priority) {
      filteredLeads = filteredLeads.filter(lead => lead.priority === query.priority);
    }
    
    if (query.source) {
      filteredLeads = filteredLeads.filter(lead => lead.source === query.source);
    }
    
    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      filteredLeads = filteredLeads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm) ||
        lead.phone.toLowerCase().includes(searchTerm) ||
        lead.company?.toLowerCase().includes(searchTerm) ||
        lead.message?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by creation date (newest first)
    filteredLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLeads = filteredLeads.slice(startIndex, endIndex);
    
    const response: GetLeadsResponse = {
      success: true,
      leads: paginatedLeads,
      total: filteredLeads.length,
      page,
      limit
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error getting leads:", error);
    res.status(500).json({
      success: false,
      leads: [],
      total: 0,
      page: 1,
      limit: 10
    });
  }
};

/**
 * POST /api/leads - Create a new lead
 */
export const createLead: RequestHandler = (req, res) => {
  try {
    // Aceitar tanto JSON quanto form data
    const leadData = req.body as CreateLeadRequest & {
      _pixel?: string;
      _referrer?: string;
      _url?: string;
    };

    // Validate required fields
    if (!leadData.phone || !leadData.source) {
      const response: CreateLeadResponse = {
        success: false,
        error: "WhatsApp e origem são obrigatórios"
      };
      return res.status(400).json(response);
    }
    
    // Create new lead
    const newLead: Lead = {
      id: nextId.toString(),
      phone: leadData.phone,
      source: leadData.source,
      name: leadData.name, // opcional
      email: leadData.email, // opcional
      company: leadData.company,
      message: leadData.message,
      status: "new",
      priority: "medium",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: leadData.tags || []
    };
    
    nextId++;
    leads.push(newLead);

    // Trigger webhooks asynchronously (don't wait for them)
    triggerWebhooks(newLead).catch(error => {
      console.error("Error triggering webhooks:", error);
    });

    const response: CreateLeadResponse = {
      success: true,
      lead: newLead
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating lead:", error);
    const response: CreateLeadResponse = {
      success: false,
      error: "Erro interno do servidor"
    };
    res.status(500).json(response);
  }
};

/**
 * PUT /api/leads/:id - Update a lead
 */
export const updateLead: RequestHandler = (req, res) => {
  try {
    const leadId = req.params.id;
    const updates = req.body as UpdateLeadRequest;
    
    const leadIndex = leads.findIndex(lead => lead.id === leadId);
    
    if (leadIndex === -1) {
      const response: UpdateLeadResponse = {
        success: false,
        error: "Lead não encontrado"
      };
      return res.status(404).json(response);
    }
    
    // Update lead
    const updatedLead = {
      ...leads[leadIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    leads[leadIndex] = updatedLead;
    
    const response: UpdateLeadResponse = {
      success: true,
      lead: updatedLead
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error updating lead:", error);
    const response: UpdateLeadResponse = {
      success: false,
      error: "Erro interno do servidor"
    };
    res.status(500).json(response);
  }
};

/**
 * DELETE /api/leads/:id - Delete a lead
 */
export const deleteLead: RequestHandler = (req, res) => {
  try {
    const leadId = req.params.id;
    
    const leadIndex = leads.findIndex(lead => lead.id === leadId);
    
    if (leadIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Lead não encontrado"
      });
    }
    
    leads.splice(leadIndex, 1);
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor"
    });
  }
};

/**
 * GET /api/dashboard/stats - Get dashboard statistics
 */
export const getDashboardStats: RequestHandler = (req, res) => {
  try {
    const totalLeads = leads.length;
    const newLeads = leads.filter(lead => lead.status === "new").length;
    const convertedLeads = leads.filter(lead => lead.status === "converted").length;
    
    const leadsByStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<Lead["status"], number>);
    
    const leadsBySource = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get 5 most recent leads
    const recentLeads = [...leads]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    const response: DashboardStatsResponse = {
      totalLeads,
      newLeads,
      convertedLeads,
      leadsByStatus,
      leadsBySource,
      recentLeads
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
      recentLeads: []
    });
  }
};
