# Deploy LeadHub em Produção - Porta 80

## 🚀 Soluções Corrigidas

### ✅ **Problema Resolvido**
- **Erro**: `require is not defined in ES module scope`
- **Causa**: Conflito entre sintaxe CommonJS e ES modules
- **Solução**: Uso direto do `tsx` para execução TypeScript

### 🐳 **Dockerfiles Disponíveis**

#### Opção 1: Dockerfile (Simples)
```bash
docker build -t leadhub .
docker run -p 80:80 -e MYSQL_DB="sua_connection_string" leadhub
```

#### Opção 2: Dockerfile.production (Robusto com fallback)
```bash
docker build -f Dockerfile.production -t leadhub .
docker run -p 80:80 -e MYSQL_DB="sua_connection_string" leadhub
```

#### Opção 3: Dockerfile.simple (Mais direto)
```bash
docker build -f Dockerfile.simple -t leadhub .
docker run -p 80:80 -e MYSQL_DB="sua_connection_string" leadhub
```

### ���� **Scripts npm Corrigidos**
```json
{
  "start": "npx tsx server/production.ts",
  "start:alt": "node dist/server/production.mjs", 
  "start:dev": "npx tsx server/production.ts"
}
```

### 🔧 **Configuração de Porta**
- **Porta padrão**: 80 (configurada em `server/production.ts`)
- **Variável**: `PORT=80` (pode ser alterada via env)
- **Health check**: `http://localhost:80/api/health`

### ⚡ **Execução Local (para teste)**
```bash
npm install
PORT=80 npm start
```

### 🏥 **Health Check**
```bash
curl http://localhost:80/api/health
# Resposta esperada: {"status":"ok","timestamp":"...","service":"LeadHub API"}
```

### 🌐 **URLs da Aplicação**
- **Frontend**: `http://localhost:80/`
- **API**: `http://localhost:80/api/`
- **Health**: `http://localhost:80/api/health`
- **Leads**: `http://localhost:80/api/leads`
- **Webhooks**: `http://localhost:80/api/webhooks`

### 🔒 **Variáveis de Ambiente**
```bash
# Obrigatórias
MYSQL_DB=mysql://user:pass@host:3306/database

# Opcionais  
NODE_ENV=production
PORT=80
```

### 🎯 **Recomendação Final**
Use o **Dockerfile.production** que é o mais robusto:
- Tenta usar build otimizado primeiro
- Fallback para TypeScript se build falhar
- Health check configurado
- Usuário não-root para segurança
- Porta 80 garantida

```bash
docker build -f Dockerfile.production -t leadhub .
docker run -d \
  --name leadhub-prod \
  -p 80:80 \
  -e MYSQL_DB="mysql://user:pass@host:3306/database" \
  --restart unless-stopped \
  leadhub
```

Sistema pronto para produção na porta 80! 🎉
