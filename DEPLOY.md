# Deploy LeadHub em Produção

## 🚀 Opções de Deploy

### Opção 1: Deploy Rápido (Recomendado)

```bash
# 1. Construir para produção
chmod +x build-production.sh
./build-production.sh

# 2. Executar em produção
docker run -d \
  --name leadhub-prod \
  -p 80:80 \
  -e MYSQL_DB="mysql://user:pass@host:3306/database" \
  --restart unless-stopped \
  leadhub:latest
```

### Opção 2: Docker Compose Produção

```bash
# 1. Configurar variáveis
cp .env.production .env
# Editar .env com suas configurações

# 2. Deploy com MySQL e Nginx
docker-compose -f docker-compose.prod.yml up -d

# 3. Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Opção 3: Cloud Deploy

#### Fly.io

```bash
# Configurar fly.toml
fly launch --dockerfile
fly deploy
```

#### Railway

```bash
railway login
railway link
railway up
```

#### DigitalOcean App Platform

1. Conectar repositório GitHub
2. Configurar Dockerfile build
3. Adicionar variáveis de ambiente
4. Deploy automático

## 🔧 Configuração Obrigatória

### Variáveis de Ambiente

```bash
# Database (OBRIGATÓRIO)
MYSQL_DB=mysql://username:password@host:3306/database_name

# Servidor
NODE_ENV=production
PORT=80
```

### Exemplos de String de Conexão

```bash
# PlanetScale (Recomendado)
MYSQL_DB="mysql://user:pass@aws.connect.psdb.cloud/leadhub?ssl=true&sslaccept=strict"

# Amazon RDS
MYSQL_DB="mysql://admin:password@leadhub.cluster-xyz.us-east-1.rds.amazonaws.com:3306/leadhub?ssl=true"

# DigitalOcean Managed Database
MYSQL_DB="mysql://user:pass@db-mysql-leadhub-do-user-123456-0.db.ondigitalocean.com:25060/leadhub?ssl=true"

# Google Cloud SQL
MYSQL_DB="mysql://user:pass@34.123.45.67:3306/leadhub?ssl=true"
```

## 🛡️ Segurança em Produção

### SSL/HTTPS (nginx incluído)

```bash
# Gerar certificados SSL (Let's Encrypt)
certbot --nginx -d yourdomain.com

# Ou usar certificados existentes
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
```

### Firewall

```bash
# Permitir apenas portas necessárias
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

## 📊 Monitoramento

### Health Check

```bash
curl http://localhost/api/health
# Resposta: {"status":"ok","timestamp":"...","service":"LeadHub API"}
```

### Logs de Produção

```bash
# Docker logs
docker logs leadhub-prod -f

# Docker Compose logs
docker-compose -f docker-compose.prod.yml logs -f

# Logs específicos
docker-compose -f docker-compose.prod.yml logs leadhub
```

### Métricas

```bash
# Status dos containers
docker ps

# Uso de recursos
docker stats

# Espaço em disco
docker system df
```

## 🔄 Backup e Manutenção

### Backup do MySQL

```bash
# Backup automático
docker exec mysql mysqldump -u leadhub -p leadhub > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
docker exec -i mysql mysql -u leadhub -p leadhub < backup.sql
```

### Atualizações

```bash
# 1. Rebuild image
docker build -t leadhub:latest .

# 2. Stop container
docker stop leadhub-prod

# 3. Remove old container
docker rm leadhub-prod

# 4. Start new container
docker run -d \
  --name leadhub-prod \
  -p 80:80 \
  -e MYSQL_DB="..." \
  --restart unless-stopped \
  leadhub:latest
```

## 🚨 Troubleshooting

### Problemas Comuns

**Erro de Conexão MySQL:**

- Verificar string de conexão
- Testar conectividade: `telnet host 3306`
- Verificar permissões do usuário

**Container não inicia:**

- Ver logs: `docker logs leadhub-prod`
- Verificar variáveis de ambiente
- Verificar porta disponível: `netstat -ln | grep :80`

**Performance lenta:**

- Verificar recursos: `docker stats`
- Otimizar MySQL: adicionar índices
- Usar Redis para cache (futuro)

### Logs de Debug

```bash
# Habilitar logs detalhados
docker run -e DEBUG=* leadhub:latest

# Logs do sistema
journalctl -u docker.service -f
```

## 📈 Otimizações para Produção

### Performance

- Use PlanetScale ou RDS para MySQL
- Configure CDN para assets estáticos
- Implemente cache Redis (opcional)
- Use load balancer para múltiplas instâncias

### Escalabilidade

```bash
# Múltiplas instâncias
docker-compose -f docker-compose.prod.yml up --scale leadhub=3
```

### Monitoramento Avançado

- Sentry para error tracking
- New Relic ou DataDog para APM
- Grafana + Prometheus para métricas

## 🔗 URLs Importantes

- **Health Check**: `http://localhost/api/health`
- **Admin Dashboard**: `http://localhost/`
- **API Documentation**: `http://localhost/api/`
- **MySQL Port**: `3306` (se exposto)

## ✅ Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] MySQL database criado e acessível
- [ ] SSL certificados instalados (para HTTPS)
- [ ] Firewall configurado
- [ ] Backup strategy definida
- [ ] Monitoring configurado
- [ ] DNS apontando para servidor
- [ ] Health check funcionando
