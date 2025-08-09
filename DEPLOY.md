# Deploy LeadHub

## Docker Deployment

### Opção 1: Docker Compose (Recomendado para desenvolvimento)

```bash
# Construir e executar com MySQL incluído
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

### Opção 2: Docker Build Manual

```bash
# Construir a imagem
docker build -t leadhub .

# Executar (com MySQL externo)
docker run -d \
  --name leadhub \
  -p 80:80 \
  -e MYSQL_DB="mysql://user:pass@host:3306/database" \
  leadhub
```

### Opção 3: Deploy em Produção

#### Variáveis de Ambiente Obrigatórias

```bash
# String de conexão MySQL
MYSQL_DB=mysql://username:password@host:3306/database_name

# Opcional
NODE_ENV=production
PORT=8080
```

#### Deploy em Cloud Providers

**Fly.io:**
```bash
fly launch
fly deploy
```

**Railway:**
```bash
railway login
railway link
railway up
```

**DigitalOcean App Platform:**
- Upload o código para GitHub
- Criar novo App
- Configurar variáveis de ambiente
- Deploy automático

**Heroku:**
```bash
heroku create leadhub-app
heroku addons:create cleardb:ignite
heroku config:set MYSQL_DB=$(heroku config:get CLEARDB_DATABASE_URL)
git push heroku main
```

## Configuração de Banco de Dados

### Providers Recomendados

**Desenvolvimento/Teste:**
- MySQL via Docker Compose (incluído)
- XAMPP/WAMP local

**Produção:**
- PlanetScale (recomendado)
- Amazon RDS
- Google Cloud SQL  
- DigitalOcean Managed Databases
- ClearDB (Heroku)

### String de Conexão

```
mysql://[username]:[password]@[host]:[port]/[database]?ssl=true
```

Exemplos:
```bash
# PlanetScale
MYSQL_DB="mysql://user:pass@aws.connect.psdb.cloud/leadhub?ssl=true&sslaccept=strict"

# Amazon RDS
MYSQL_DB="mysql://admin:password@leadhub.cluster-xyz.us-east-1.rds.amazonaws.com:3306/leadhub?ssl=true"

# Local
MYSQL_DB="mysql://root:password@localhost:3306/leadhub"
```

## Estrutura de Arquivos

```
leadhub/
├── Dockerfile              # Imagem de produção
├── docker-compose.yml      # Desenvolvimento local
├── .dockerignore           # Arquivos ignorados no build
├── server/                 # Backend Express
├── client/                 # Frontend React
├── shared/                 # Tipos compartilhados
└── dist/                   # Build de produção (gerado)
```

## Verificações de Deploy

1. **Health Check**: `GET /api/health`
2. **Database**: Sistema funciona em modo fallback se MySQL indisponível
3. **Logs**: Monitor logs para erros de conexão
4. **Performance**: App otimizada para produção

## Troubleshooting

**Erro de Conexão MySQL:**
- Verificar string de conexão
- Confirmar credenciais
- Testar conectividade de rede

**Build Falha:**
- Verificar versão Node.js (18+)
- Limpar cache npm: `npm clean-install`

**App não inicia:**
- Verificar PORT (padrão 8080)
- Ver logs: `docker logs leadhub`
