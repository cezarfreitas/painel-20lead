import Database from 'better-sqlite3';
import path from 'path';

// Initialize SQLite database
const dbPath = path.join(process.cwd(), 'leadhub.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function initializeDatabase() {
  // Create leads table
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      phone TEXT NOT NULL,
      source TEXT NOT NULL,
      name TEXT,
      email TEXT,
      company TEXT,
      message TEXT,
      status TEXT DEFAULT 'new',
      priority TEXT DEFAULT 'medium',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      tags TEXT DEFAULT '[]'
    )
  `);

  // Create webhooks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS webhooks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_triggered TEXT,
      success_count INTEGER DEFAULT 0,
      failure_count INTEGER DEFAULT 0
    )
  `);

  // Create webhook_logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS webhook_logs (
      id TEXT PRIMARY KEY,
      webhook_id TEXT NOT NULL,
      lead_id TEXT NOT NULL,
      url TEXT NOT NULL,
      status TEXT NOT NULL,
      http_status INTEGER,
      response TEXT,
      error TEXT,
      attempt INTEGER NOT NULL,
      max_attempts INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      next_retry TEXT,
      FOREIGN KEY (webhook_id) REFERENCES webhooks (id),
      FOREIGN KEY (lead_id) REFERENCES leads (id)
    )
  `);

  console.log('Database initialized successfully');
}

// Insert sample data if tables are empty
function insertSampleData() {
  const leadsCount = db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
  
  if (leadsCount.count === 0) {
    console.log('Inserting sample leads...');
    
    const insertLead = db.prepare(`
      INSERT INTO leads (id, phone, source, name, company, message, status, priority, created_at, updated_at, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

    insertLead.run('1', '+55 11 99999-9999', 'landing-page-produtos', 'João Silva', 'Tech Solutions Ltd', 'Interessado em saber mais sobre os serviços', 'new', 'high', twoDaysAgo, twoDaysAgo, '["produto", "premium"]');
    insertLead.run('2', '+55 21 88888-8888', 'formulario-contato', 'Maria Santos', 'Inovação & Co', 'Gostaria de agendar uma demonstração', 'contacted', 'medium', dayAgo, dayAgo, '["demo", "empresarial"]');
    insertLead.run('3', '+55 11 99999-9999', 'webinar-growth', 'Pedro Costa', 'StartupXYZ', 'Preciso de uma solução escalável', 'qualified', 'high', now, now, '["startup", "growth"]');
  }

  const webhooksCount = db.prepare('SELECT COUNT(*) as count FROM webhooks').get() as { count: number };
  
  if (webhooksCount.count === 0) {
    console.log('Inserting sample webhooks...');
    
    const insertWebhook = db.prepare(`
      INSERT INTO webhooks (id, name, url, is_active, created_at, updated_at, last_triggered, success_count, failure_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    insertWebhook.run('wh_001', 'Sistema CRM Principal', 'https://api.meucrm.com/webhooks/leads', 1, weekAgo, weekAgo, hourAgo, 45, 2);
    insertWebhook.run('wh_002', 'Sistema de Email Marketing', 'https://emailmarketing.com/api/contacts', 1, threeDaysAgo, threeDaysAgo, hourAgo, 23, 0);
  }
}

// Database operations for leads
export const LeadDB = {
  getAll: (params: { search?: string; page?: number; limit?: number }) => {
    let query = 'SELECT * FROM leads';
    let countQuery = 'SELECT COUNT(*) as count FROM leads';
    const conditions: string[] = [];
    const values: any[] = [];

    if (params.search) {
      conditions.push('(name LIKE ? OR phone LIKE ? OR company LIKE ? OR message LIKE ?)');
      const searchTerm = `%${params.search}%`;
      values.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' ORDER BY created_at DESC';

    if (params.limit) {
      query += ' LIMIT ?';
      values.push(params.limit);
      
      if (params.page && params.page > 1) {
        query += ' OFFSET ?';
        values.push((params.page - 1) * params.limit);
      }
    }

    const leads = db.prepare(query).all(...values);
    const total = (db.prepare(countQuery).get(...values.slice(0, -2)) as any)?.count || 0;

    return { leads, total };
  },

  create: (lead: any) => {
    const stmt = db.prepare(`
      INSERT INTO leads (id, phone, source, name, email, company, message, status, priority, created_at, updated_at, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      lead.id,
      lead.phone,
      lead.source,
      lead.name || null,
      lead.email || null,
      lead.company || null,
      lead.message || null,
      lead.status || 'new',
      lead.priority || 'medium',
      lead.createdAt,
      lead.updatedAt,
      JSON.stringify(lead.tags || [])
    );
    
    return db.prepare('SELECT * FROM leads WHERE id = ?').get(lead.id);
  },

  getById: (id: string) => {
    return db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  },

  update: (id: string, updates: any) => {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    
    db.prepare(`UPDATE leads SET ${fields}, updated_at = ? WHERE id = ?`)
      .run(...values, new Date().toISOString());
    
    return db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  },

  delete: (id: string) => {
    return db.prepare('DELETE FROM leads WHERE id = ?').run(id);
  }
};

// Database operations for webhooks
export const WebhookDB = {
  getAll: () => {
    return db.prepare('SELECT * FROM webhooks ORDER BY created_at DESC').all();
  },

  create: (webhook: any) => {
    const stmt = db.prepare(`
      INSERT INTO webhooks (id, name, url, is_active, created_at, updated_at, success_count, failure_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      webhook.id,
      webhook.name,
      webhook.url,
      webhook.isActive ? 1 : 0,
      webhook.createdAt,
      webhook.updatedAt,
      webhook.successCount || 0,
      webhook.failureCount || 0
    );
    
    return db.prepare('SELECT * FROM webhooks WHERE id = ?').get(webhook.id);
  },

  getById: (id: string) => {
    return db.prepare('SELECT * FROM webhooks WHERE id = ?').get(id);
  },

  update: (id: string, updates: any) => {
    const dbUpdates: any = { ...updates };
    if ('isActive' in dbUpdates) {
      dbUpdates.is_active = dbUpdates.isActive ? 1 : 0;
      delete dbUpdates.isActive;
    }
    
    const fields = Object.keys(dbUpdates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(dbUpdates);
    values.push(id);
    
    db.prepare(`UPDATE webhooks SET ${fields}, updated_at = ? WHERE id = ?`)
      .run(...values, new Date().toISOString());
    
    return db.prepare('SELECT * FROM webhooks WHERE id = ?').get(id);
  },

  delete: (id: string) => {
    return db.prepare('DELETE FROM webhooks WHERE id = ?').run(id);
  },

  getActive: () => {
    return db.prepare('SELECT * FROM webhooks WHERE is_active = 1').all();
  },

  incrementSuccess: (id: string) => {
    db.prepare(`
      UPDATE webhooks 
      SET success_count = success_count + 1, last_triggered = ?
      WHERE id = ?
    `).run(new Date().toISOString(), id);
  },

  incrementFailure: (id: string) => {
    db.prepare(`
      UPDATE webhooks 
      SET failure_count = failure_count + 1
      WHERE id = ?
    `).run(id);
  }
};

// Database operations for webhook logs
export const WebhookLogDB = {
  create: (log: any) => {
    const stmt = db.prepare(`
      INSERT INTO webhook_logs (id, webhook_id, lead_id, url, status, http_status, response, error, attempt, max_attempts, created_at, next_retry)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
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
      log.createdAt,
      log.nextRetry || null
    );
  },

  getRecent: (limit: number = 100) => {
    return db.prepare(`
      SELECT * FROM webhook_logs 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(limit);
  }
};

// Initialize database on import
initializeDatabase();
insertSampleData();

export default db;
