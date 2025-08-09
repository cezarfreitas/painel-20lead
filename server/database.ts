import mysql from "mysql2/promise";

let db: mysql.Connection;

let isConnected = false;

// Initialize MySQL connection
async function initializeDatabase() {
  try {
    const connectionUrl = process.env.MYSQL_DB || process.env.DATABASE_URL;

    if (!connectionUrl) {
      console.warn(
        "MYSQL_DB environment variable not found, using mock data mode",
      );
      isConnected = false;
      return;
    }

    console.log("Connecting to MySQL database...");
    db = await mysql.createConnection(connectionUrl);

    // Test connection
    await db.ping();

    console.log("Connected to MySQL database successfully");
    isConnected = true;

    // Create tables
    await createTables();
    await insertSampleData();

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to connect to MySQL database:", error);
    console.log("Fallback to mock data mode");
    isConnected = false;
  }
}

async function createTables() {
  // Create leads table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS leads (
      id VARCHAR(50) PRIMARY KEY,
      phone VARCHAR(20) NOT NULL,
      source VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      email VARCHAR(255),
      company VARCHAR(255),
      message TEXT,
      status ENUM('new', 'contacted', 'qualified', 'converted', 'lost') DEFAULT 'new',
      priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      tags JSON,
      custom_data JSON
    )
  `);

  // Create webhooks table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS webhooks (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      last_triggered DATETIME,
      success_count INT DEFAULT 0,
      failure_count INT DEFAULT 0,
      custom_fields JSON,
      send_fields JSON
    )
  `);

  // Create webhook_logs table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS webhook_logs (
      id VARCHAR(50) PRIMARY KEY,
      webhook_id VARCHAR(50) NOT NULL,
      lead_id VARCHAR(50) NOT NULL,
      url TEXT NOT NULL,
      status ENUM('success', 'failed', 'retrying') NOT NULL,
      http_status INT,
      response TEXT,
      error TEXT,
      attempt INT NOT NULL,
      max_attempts INT NOT NULL,
      created_at DATETIME NOT NULL,
      next_retry DATETIME,
      FOREIGN KEY (webhook_id) REFERENCES webhooks (id) ON DELETE CASCADE,
      FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE
    )
  `);
}

// Clean up corrupted tags data
async function cleanupCorruptedTags() {
  try {
    // Get all leads with corrupted tags (should be JSON arrays but are strings)
    const [leads] = (await db.execute(
      "SELECT id, tags FROM leads WHERE tags IS NOT NULL",
    )) as any;

    for (const lead of leads) {
      if (
        lead.tags &&
        typeof lead.tags === "string" &&
        !lead.tags.startsWith("[")
      ) {
        // This is a corrupted tag (comma-separated string)
        let fixedTags = "[]";

        if (lead.tags.includes(",")) {
          const tagArray = lead.tags
            .split(",")
            .map((tag: string) => tag.trim());
          fixedTags = JSON.stringify(tagArray);
        } else if (lead.tags.length > 0) {
          fixedTags = JSON.stringify([lead.tags]);
        }

        await db.execute("UPDATE leads SET tags = ? WHERE id = ?", [
          fixedTags,
          lead.id,
        ]);
        console.log(
          `Fixed tags for lead ${lead.id}: ${lead.tags} -> ${fixedTags}`,
        );
      }
    }
  } catch (error) {
    console.error("Error cleaning up corrupted tags:", error);
  }
}

// Insert sample data if tables are empty
async function insertSampleData() {
  // First clean up any corrupted data
  await cleanupCorruptedTags();

  const [leadsResult] = (await db.execute(
    "SELECT COUNT(*) as count FROM leads",
  )) as any;

  if (leadsResult[0].count === 0) {
    console.log("Inserting sample leads...");

    const now = new Date();
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    await db.execute(
      `
      INSERT INTO leads (id, phone, source, name, company, message, status, priority, created_at, updated_at, tags, custom_data)
      VALUES
        ('1', '+55 11 99999-9999', 'landing-page-produtos', 'João Silva', 'Tech Solutions Ltd', 'Interessado em saber mais sobre os serviços', 'new', 'high', ?, ?, ?, ?),
        ('2', '+55 21 88888-8888', 'formulario-contato', 'Maria Santos', 'Inovação & Co', 'Gostaria de agendar uma demonstração', 'contacted', 'medium', ?, ?, ?, ?),
        ('3', '+55 11 99999-9999', 'webinar-growth', 'Pedro Costa', 'StartupXYZ', 'Preciso de uma solução escalável', 'qualified', 'high', ?, ?, ?, ?)
    `,
      [
        twoDaysAgo,
        twoDaysAgo,
        JSON.stringify(["produto", "premium"]),
        JSON.stringify({ budget: "R$ 5.000", interesse: "plano-premium" }),
        dayAgo,
        dayAgo,
        JSON.stringify(["demo", "empresarial"]),
        JSON.stringify({ agendamento: "2025-08-15", funcionarios: 50 }),
        now,
        now,
        JSON.stringify(["startup", "growth"]),
        JSON.stringify({ stage: "series-a", employees: 15, revenue: "R$ 100k/mês" }),
      ],
    );
  }

  const [webhooksResult] = (await db.execute(
    "SELECT COUNT(*) as count FROM webhooks",
  )) as any;

  if (webhooksResult[0].count === 0) {
    console.log("Inserting sample webhooks...");
    console.log(
      "[WEBHOOK] No existing webhooks found, creating sample webhooks",
    );

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

    await db.execute(
      `
      INSERT INTO webhooks (id, name, url, is_active, created_at, updated_at, last_triggered, success_count, failure_count, custom_fields, send_fields)
      VALUES
        ('wh_001', 'Sistema CRM Principal', 'https://api.meucrm.com/webhooks/leads', true, ?, ?, ?, 45, 2, ?, ?),
        ('wh_002', 'Sistema de Email Marketing', 'https://emailmarketing.com/api/contacts', true, ?, ?, ?, 23, 0, ?, ?)
    `,
      [
        weekAgo, weekAgo, hourAgo,
        JSON.stringify([
          { name: "budget", label: "Orçamento", type: "text", required: false },
          { name: "interesse", label: "Interesse", type: "text", required: false }
        ]),
        JSON.stringify(["phone", "name", "source", "budget", "interesse"]),
        threeDaysAgo, threeDaysAgo, hourAgo,
        JSON.stringify([
          { name: "agendamento", label: "Data Agendamento", type: "text", required: false },
          { name: "funcionarios", label: "Qtd Funcionários", type: "number", required: false }
        ]),
        JSON.stringify(["phone", "name", "email", "company", "agendamento", "funcionarios"])
      ],
    );
    console.log("[WEBHOOK] Sample webhooks inserted successfully");
  }
}

// Mock data for fallback
let mockLeads: any[] = [
  {
    id: "1",
    phone: "+55 11 99999-9999",
    source: "landing-page-produtos",
    name: "João Silva",
    company: "Tech Solutions Ltd",
    message: "Interessado em saber mais sobre os serviços",
    status: "new",
    priority: "high",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: JSON.stringify(["produto", "premium"]),
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
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tags: JSON.stringify(["demo", "empresarial"]),
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
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    tags: JSON.stringify(["startup", "growth"]),
  },
];

let mockWebhooks: any[] = [
  {
    id: "wh_001",
    name: "Sistema CRM Principal",
    url: "https://api.meucrm.com/webhooks/leads",
    is_active: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    last_triggered: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    success_count: 45,
    failure_count: 2,
  },
  {
    id: "wh_002",
    name: "Sistema de Email Marketing",
    url: "https://emailmarketing.com/api/contacts",
    is_active: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_triggered: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    success_count: 23,
    failure_count: 0,
  },
];

let mockLogs: any[] = [];
let nextMockId = 4;

// Database operations for leads
export const LeadDB = {
  getAll: async (params: {
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    if (!isConnected) {
      // Mock data fallback
      let filteredLeads = [...mockLeads];

      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        filteredLeads = filteredLeads.filter(
          (lead) =>
            lead.name?.toLowerCase().includes(searchTerm) ||
            lead.phone.toLowerCase().includes(searchTerm) ||
            lead.company?.toLowerCase().includes(searchTerm) ||
            lead.message?.toLowerCase().includes(searchTerm),
        );
      }

      filteredLeads.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      if (params.limit) {
        const startIndex = ((params.page || 1) - 1) * params.limit;
        filteredLeads = filteredLeads.slice(
          startIndex,
          startIndex + params.limit,
        );
      }

      return { leads: filteredLeads, total: filteredLeads.length };
    }

    let query = "SELECT * FROM leads";
    let countQuery = "SELECT COUNT(*) as count FROM leads";
    const conditions: string[] = [];
    const values: any[] = [];

    if (params.search) {
      conditions.push(
        "(name LIKE ? OR phone LIKE ? OR company LIKE ? OR message LIKE ?)",
      );
      const searchTerm = `%${params.search}%`;
      values.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ");
      query += whereClause;
      countQuery += whereClause;
    }

    query += " ORDER BY created_at DESC";

    if (params.limit) {
      const limitValue = parseInt(params.limit.toString(), 10);
      query += ` LIMIT ${limitValue}`;

      if (params.page && params.page > 1) {
        const offsetValue = (params.page - 1) * limitValue;
        query += ` OFFSET ${offsetValue}`;
      }
    }

    const [leads] = await db.execute(query, values);

    // For count query, use only search values (not limit/offset)
    const countValues = [];
    if (params.search) {
      const searchTerm = `%${params.search}%`;
      countValues.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    const [totalResult] = (await db.execute(countQuery, countValues)) as any;
    const total = totalResult[0]?.count || 0;

    return { leads, total };
  },

  create: async (lead: any) => {
    if (!isConnected) {
      // Mock data fallback
      const newLead = {
        id: lead.id,
        phone: lead.phone,
        source: lead.source,
        name: lead.name || null,
        email: lead.email || null,
        company: lead.company || null,
        message: lead.message || null,
        status: lead.status || "new",
        priority: lead.priority || "medium",
        created_at: lead.createdAt,
        updated_at: lead.updatedAt,
        tags: JSON.stringify(lead.tags || []),
      };
      mockLeads.push(newLead);
      return newLead;
    }

    await db.execute(
      `
      INSERT INTO leads (id, phone, source, name, email, company, message, status, priority, created_at, updated_at, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        lead.id,
        lead.phone,
        lead.source,
        lead.name || null,
        lead.email || null,
        lead.company || null,
        lead.message || null,
        lead.status || "new",
        lead.priority || "medium",
        new Date(lead.createdAt),
        new Date(lead.updatedAt),
        JSON.stringify(lead.tags || []),
      ],
    );

    const [result] = await db.execute("SELECT * FROM leads WHERE id = ?", [
      lead.id,
    ]);
    return (result as any[])[0];
  },

  getById: async (id: string) => {
    if (!isConnected) {
      return mockLeads.find((lead) => lead.id === id);
    }
    const [result] = await db.execute("SELECT * FROM leads WHERE id = ?", [id]);
    return (result as any[])[0];
  },

  update: async (id: string, updates: any) => {
    if (!isConnected) {
      const leadIndex = mockLeads.findIndex((lead) => lead.id === id);
      if (leadIndex !== -1) {
        mockLeads[leadIndex] = {
          ...mockLeads[leadIndex],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        return mockLeads[leadIndex];
      }
      return null;
    }

    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);
    values.push(new Date(), id);

    await db.execute(
      `UPDATE leads SET ${fields}, updated_at = ? WHERE id = ?`,
      values,
    );

    const [result] = await db.execute("SELECT * FROM leads WHERE id = ?", [id]);
    return (result as any[])[0];
  },

  delete: async (id: string) => {
    if (!isConnected) {
      const leadIndex = mockLeads.findIndex((lead) => lead.id === id);
      if (leadIndex !== -1) {
        mockLeads.splice(leadIndex, 1);
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }
    return await db.execute("DELETE FROM leads WHERE id = ?", [id]);
  },
};

// Database operations for webhooks
export const WebhookDB = {
  getAll: async () => {
    if (!isConnected) {
      return [...mockWebhooks].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }
    const [result] = await db.execute(
      "SELECT * FROM webhooks ORDER BY created_at DESC",
    );
    return result;
  },

  create: async (webhook: any) => {
    await db.execute(
      `
      INSERT INTO webhooks (id, name, url, is_active, created_at, updated_at, success_count, failure_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        webhook.id,
        webhook.name,
        webhook.url,
        webhook.isActive,
        new Date(webhook.createdAt),
        new Date(webhook.updatedAt),
        webhook.successCount || 0,
        webhook.failureCount || 0,
      ],
    );

    const [result] = await db.execute("SELECT * FROM webhooks WHERE id = ?", [
      webhook.id,
    ]);
    return (result as any[])[0];
  },

  getById: async (id: string) => {
    const [result] = await db.execute("SELECT * FROM webhooks WHERE id = ?", [
      id,
    ]);
    return (result as any[])[0];
  },

  update: async (id: string, updates: any) => {
    const dbUpdates: any = { ...updates };
    if ("isActive" in dbUpdates) {
      dbUpdates.is_active = dbUpdates.isActive;
      delete dbUpdates.isActive;
    }

    const fields = Object.keys(dbUpdates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(dbUpdates);
    values.push(new Date(), id);

    await db.execute(
      `UPDATE webhooks SET ${fields}, updated_at = ? WHERE id = ?`,
      values,
    );

    const [result] = await db.execute("SELECT * FROM webhooks WHERE id = ?", [
      id,
    ]);
    return (result as any[])[0];
  },

  delete: async (id: string) => {
    return await db.execute("DELETE FROM webhooks WHERE id = ?", [id]);
  },

  getActive: async () => {
    if (!isConnected) {
      return mockWebhooks.filter((wh) => wh.is_active);
    }
    const [result] = await db.execute(
      "SELECT * FROM webhooks WHERE is_active = 1",
    );
    return result;
  },

  incrementSuccess: async (id: string) => {
    await db.execute(
      `
      UPDATE webhooks 
      SET success_count = success_count + 1, last_triggered = ?
      WHERE id = ?
    `,
      [new Date(), id],
    );
  },

  incrementFailure: async (id: string) => {
    await db.execute(
      `
      UPDATE webhooks 
      SET failure_count = failure_count + 1
      WHERE id = ?
    `,
      [id],
    );
  },
};

// Database operations for webhook logs
export const WebhookLogDB = {
  create: async (log: any) => {
    if (!isConnected) {
      console.log("WebhookLogDB: Using mock mode - log not persisted");
      return;
    }

    await db.execute(
      `
      INSERT INTO webhook_logs (id, webhook_id, lead_id, url, status, http_status, response, error, attempt, max_attempts, created_at, next_retry)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        log.id,
        log.webhookId,
        log.leadId,
        log.url,
        log.status,
        log.httpStatus || null,
        log.response || null,
        log.error || null,
        log.attempt,
        log.maxAttempts,
        new Date(log.createdAt),
        log.nextRetry ? new Date(log.nextRetry) : null,
      ],
    );
  },

  getRecent: async (limit: number = 100) => {
    const [result] = await db.execute(
      `
      SELECT * FROM webhook_logs 
      ORDER BY created_at DESC 
      LIMIT ?
    `,
      [limit],
    );
    return result;
  },
};

// Initialize database on import
initializeDatabase().catch(console.error);

export default db;
