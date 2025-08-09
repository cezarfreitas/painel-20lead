# 📥 Recebimento de Dados via API - LeadHub

## ✅ Sistema Já Configurado

O LeadHub já está **100% preparado** para receber o JSON complexo que você forneceu. Todos os campos serão automaticamente armazenados no sistema.

## 🎯 Como Funciona

### Campos Obrigatórios

- `phone` ou `whatsapp` (WhatsApp do lead)
- `source` ou `origem` (origem do lead)

### Campos Opcionais Padrão

- `name` (nome)
- `email` (email)
- `company` (empresa)
- `message` (mensagem)

### ⭐ Campos Customizados (TODOS OS OUTROS)

Qualquer campo adicional enviado será automaticamente armazenado como `customData`:

```json
{
  "name": "cezar",
  "phone": "11989882867",
  "source": "Landing Page Lojistas",
  "marca": "Ecko",
  "utm_campaign": "campanha-lojistas",
  "user_agent": "Mozilla/5.0...",
  "lead_quality": "medium",
  "engagement_score": 7,
  "qualquer_campo_personalizado": "valor"
}
```

## 📊 Exemplo com Seu JSON

### Entrada (POST /api/leads)

```json
{
  "name": "cezar",
  "whatsapp": "11989882867",
  "hasCnpj": "nao-consumidor",
  "cnpj": null,
  "marca": "Ecko",
  "origem": "Landing Page Lojistas",
  "campaign_type": "Lead Generation",
  "lead_source": "Website Form",
  "utm_source": null,
  "utm_medium": null,
  "utm_campaign": null,
  "utm_term": null,
  "utm_content": null,
  "referrer": "http://148.230.78.129:3000/",
  "traffic_source": "referral",
  "page_url": "https://ide-ecko-lp.jzo3qo.easypanel.host/",
  "page_title": "Seja Lojista Oficial Ecko - Maior Marca de Streetwear do Brasil",
  "landing_page": "/",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "language": "pt-BR",
  "screen_resolution": "1920x1080",
  "viewport_size": "1350x911",
  "timezone": "America/Sao_Paulo",
  "session_id": "me4jv68xv4begahm3ls",
  "page_load_time": 61214.5,
  "timestamp": "2025-08-09T17:50:55.634Z",
  "local_time": "09/08/2025, 14:50:55",
  "is_mobile": false,
  "is_tablet": false,
  "is_desktop": true,
  "browser": "Chrome",
  "gclid": null,
  "fbclid": null,
  "cookie_consent": null,
  "lead_quality": "medium",
  "lead_type": "consumer",
  "form_completion_time": 60985.89999997616,
  "conversion_page": "/",
  "conversion_element": "main_form",
  "conversion_position": "hero_section",
  "interest_level": "high",
  "engagement_score": 7,
  "form_timestamp": "2025-08-09T17:50:55.634Z",
  "server_timestamp": null
}
```

### ⚡ Processamento Automático

O sistema automaticamente:

1. **Identifica campos padrão**:

   - `name` → campo `name`
   - `whatsapp` → campo `phone`
   - `origem` → campo `source`

2. **Armazena campos customizados**:

   - `hasCnpj`, `marca`, `utm_*`, `user_agent`, etc. → `customData`

3. **Resultado no banco**:

```sql
INSERT INTO leads (
  phone,        -- "11989882867"
  source,       -- "Landing Page Lojistas"
  name,         -- "cezar"
  custom_data   -- JSON com TODOS os outros campos
);
```

## 🔄 Webhooks Inteligentes

Os webhooks podem ser configurados para enviar apenas campos específicos:

### Configuração do Webhook

```json
{
  "sendFields": [
    "phone",
    "name",
    "source",
    "marca",
    "utm_campaign",
    "lead_quality",
    "engagement_score"
  ]
}
```

### Payload Enviado pelo Webhook

```json
{
  "leadId": "123",
  "phone": "11989882867",
  "name": "cezar",
  "source": "Landing Page Lojistas",
  "marca": "Ecko",
  "utm_campaign": null,
  "lead_quality": "medium",
  "engagement_score": 7
}
```

## 🛠️ Endpoints de API

### Criar Lead

```bash
POST /api/leads
Content-Type: application/json

# Resposta
{
  "success": true,
  "lead": {
    "id": "4",
    "phone": "11989882867",
    "source": "Landing Page Lojistas",
    "name": "cezar",
    "customData": {
      "hasCnpj": "nao-consumidor",
      "marca": "Ecko",
      "campaign_type": "Lead Generation",
      "utm_source": null,
      "user_agent": "Mozilla/5.0...",
      "engagement_score": 7,
      // ... todos os outros campos
    }
  }
}
```

### Listar Leads

```bash
GET /api/leads

# Resposta com customData incluído
{
  "leads": [
    {
      "id": "4",
      "customData": {
        "marca": "Ecko",
        "engagement_score": 7
      }
    }
  ]
}
```

## ✅ Status Atual

- ✅ **API preparada** para receber qualquer JSON
- ✅ **Banco de dados** com coluna JSON para campos customizados
- ✅ **Webhooks** podem filtrar campos específicos
- ✅ **Interface** mostra campos customizados
- ✅ **Pronto para produção**

## 🚀 Próximos Passos

1. **Testar**: Envie o JSON via POST para `/api/leads`
2. **Configurar Webhooks**: Defina quais campos enviar
3. **Monitorar**: Use a interface para acompanhar os leads

O sistema está **100% funcional** e pronto para receber seu JSON complexo! 🎉
