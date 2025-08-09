# Configuração do Banco de Dados MySQL

Este sistema foi configurado para usar MySQL como banco de dados principal. Quando o MySQL não está disponível, o sistema automaticamente usa dados mock para desenvolvimento.

## Configuração do MySQL

### 1. Configurar Variável de Ambiente

Defina a variável de ambiente `MYSQL_DB` com a string de conexão:

```bash
export MYSQL_DB="mysql://usuario:senha@host:porta/database"
```

Exemplos:

```bash
# MySQL local
export MYSQL_DB="mysql://root:password@localhost:3306/leadhub"

# MySQL na nuvem
export MYSQL_DB="mysql://user:pass@mysql.servidor.com:3306/leadhub_prod"

# Usando DATABASE_URL (alternativa)
export DATABASE_URL="mysql://user:pass@host:port/database"
```

### 2. Estrutura do Banco

O sistema criará automaticamente as seguintes tabelas:

#### Tabela `leads`

```sql
CREATE TABLE leads (
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
  tags JSON
);
```

#### Tabela `webhooks`

```sql
CREATE TABLE webhooks (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  last_triggered DATETIME,
  success_count INT DEFAULT 0,
  failure_count INT DEFAULT 0
);
```

#### Tabela `webhook_logs`

```sql
CREATE TABLE webhook_logs (
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
);
```

### 3. Configuração no Builder.io

No painel de controle do Builder.io:

1. Vá para **Configurações** > **Variáveis de Ambiente**
2. Adicione a variável `MYSQL_DB` com sua string de conexão
3. Reinicie o servidor

### 4. Modo Fallback (Mock Data)

Se a variável `MYSQL_DB` não estiver definida ou a conexão falhar, o sistema:

- ✅ Continua funcionando normalmente
- ✅ Usa dados de exemplo em memória
- ✅ Mantém todas as funcionalidades
- ⚠️ Dados são perdidos ao reiniciar

### 5. Verificação da Conexão

Logs do servidor mostrarão:

```bash
# Sucesso na conexão
"Connected to MySQL database successfully"
"Database initialized successfully"

# Fallback para mock data
"MYSQL_DB environment variable not found, using mock data mode"
"Failed to connect to MySQL database: [erro]"
"Fallback to mock data mode"
```

### 6. Providers Recomendados

**Desenvolvimento:**

- MySQL local via Docker
- XAMPP/WAMP/MAMP

**Produção:**

- PlanetScale
- Amazon RDS
- Google Cloud SQL
- Digital Ocean Managed Databases

### 7. String de Conexão Completa

```bash
mysql://[username]:[password]@[host]:[port]/[database]?[options]
```

Opções úteis:

- `ssl=true` - Para conexões SSL
- `charset=utf8mb4` - Para suporte completo UTF-8
- `timezone=Z` - Para UTC

Exemplo completo:

```bash
MYSQL_DB="mysql://user:pass@db.example.com:3306/leadhub?ssl=true&charset=utf8mb4"
```

## Migração de Dados

Para migrar dados existentes:

1. Export dados do sistema atual
2. Configure a nova conexão MySQL
3. O sistema criará as tabelas automaticamente
4. Import os dados via SQL ou API

## Troubleshooting

**Erro de Conexão:**

- Verifique host, porta, usuário e senha
- Confirme que o banco de dados existe
- Teste a conectividade de rede

**Erro de Permissões:**

- Usuário precisa de permissões CREATE, INSERT, UPDATE, DELETE, SELECT
- Para criação automática de tabelas, precisa de permissão CREATE

**Dados não Aparecem:**

- Verifique os logs do servidor
- Confirme que a variável de ambiente está definida
- Teste a conexão manualmente
