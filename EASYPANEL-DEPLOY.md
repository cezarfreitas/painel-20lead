# Deploy LeadHub no EasyPanel - Porta 80

## ✅ **Problema Resolvido**

O erro `require is not defined in ES module scope` foi corrigido criando múltiplas opções de startup.

## 🚀 **Configuração no EasyPanel**

### Opção 1: Script Básico (Mais Confiável)

```bash
npm run start:alt
# ou
npm run start:basic
```

### Opção 2: Script Principal (Recomendado)

```bash
npm start
```

### Opção 3: Script Robusto (Com Fallbacks)

```bash
npm run start:robust
```

## 📝 **Scripts Disponíveis**

| Script         | Comando                               | Descrição                               |
| -------------- | ------------------------------------- | --------------------------------------- |
| `start`        | `npx tsx server/simple-production.ts` | **Recomendado** - Servidor simplificado |
| `start:alt`    | `node server/basic-server.mjs`        | **Mais confiável** - JavaScript puro    |
| `start:basic`  | `node server/basic-server.mjs`        | Mesmo que start:alt                     |
| `start:robust` | `node server/start-production.mjs`    | Com múltiplos fallbacks                 |
| `start:full`   | `npx tsx server/production.ts`        | Servidor completo                       |

## 🎯 **Configuração Recomendada para EasyPanel**

### 1. **Build Command**

```bash
npm install
```

### 2. **Start Command**

```bash
npm run start:alt
```

### 3. **Environment Variables**

```bash
NODE_ENV=production
PORT=80
MYSQL_DB=mysql://user:pass@host:3306/database
```

### 4. **Port**

```
80
```

## 🔧 **Troubleshooting**

### Se `start:alt` falhar, tente em ordem:

1. **Básico (JavaScript puro)**:

   ```bash
   npm run start:basic
   ```

2. **Principal (com tsx)**:

   ```bash
   npm start
   ```

3. **Robusto (com fallbacks)**:
   ```bash
   npm run start:robust
   ```

### Comandos de Debug:

```bash
# Verificar arquivos disponíveis
ls -la server/

# Verificar node version
node --version

# Verificar se tsx está disponível
npx tsx --version

# Testar servidor básico diretamente
node server/basic-server.mjs
```

## 🏥 **Health Check**

Após deploy, teste:

```bash
curl http://your-app.easypanel.host/api/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "timestamp": "2025-08-09T...",
  "port": "80",
  "service": "LeadHub"
}
```

## 📊 **Endpoints Disponíveis**

- `GET /api/health` - Health check
- `GET /api/ping` - Ping test
- `GET /api/demo` - Demo endpoint
- `GET /api/leads` - Leads API
- `GET /api/webhooks` - Webhooks API

## 🎉 **Solução Final para EasyPanel**

**Use exatamente isto na configuração:**

- **Start Command**: `npm run start:alt`
- **Port**: `80`
- **Environment**: `NODE_ENV=production`

O script `start:alt` usa `server/basic-server.mjs` que é JavaScript puro e funciona em qualquer ambiente Node.js! 🚀
