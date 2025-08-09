# 📱 API LeadHub - Campo WhatsApp Obrigatório

## ✅ Ajustes Implementados

A API foi ajustada para aceitar **apenas `whatsapp` como campo obrigatório**, conforme solicitado.

### 🔧 Mudanças na Validação

**Antes:**

- `phone` e `source` obrigatórios
- Erro se qualquer um faltasse

**Agora:**

- **Apenas `whatsapp` obrigatório**
- `origem` é mapeado automaticamente para `source`
- Se `source` não existir, usa "website" como padrão

### 📝 Mapeamento Automático

A API mapeia automaticamente os campos:

```json
{
  "whatsapp": "11989882867", // → phone (interno)
  "origem": "Landing Page" // → source (interno)
}
```

### ✅ Exemplo de Uso

**JSON Mínimo (apenas whatsapp):**

```json
{
  "whatsapp": "11989882867"
}
```

**JSON Completo (como seu exemplo):**

```json
{
  "name": "cezar",
  "whatsapp": "11989882867",
  "origem": "Landing Page Lojistas",
  "marca": "Ecko",
  "campaign_type": "Lead Generation",
  "utm_source": null,
  "utm_campaign": null,
  "engagement_score": 7
}
```

### 🔄 Compatibilidade

A API ainda aceita os campos antigos para compatibilidade:

- `phone` → funciona
- `whatsapp` → **preferido**
- `source` → funciona
- `origem` → **preferido**

### 📊 Resultado no Banco

Independente de como você enviar, o lead será armazenado como:

```sql
INSERT INTO leads (
  phone,        -- "11989882867" (de whatsapp)
  source,       -- "Landing Page Lojistas" (de origem)
  name,         -- "cezar"
  custom_data   -- JSON com todos os outros campos
);
```

### 🚀 Pronto para Uso

Sua landing page pode enviar exatamente o JSON que você mostrou:

- ✅ `whatsapp` será aceito como obrigatório
- ✅ `origem` será mapeado para source
- ✅ Todos os outros campos vão para customData
- ✅ Webhooks podem filtrar qualquer campo

## 🧪 Como Testar

```bash
# Teste mínimo - só whatsapp
curl -X POST /api/leads \
  -H "Content-Type: application/json" \
  -d '{"whatsapp":"11999999999"}'

# Teste completo - seu JSON
curl -X POST /api/leads \
  -H "Content-Type: application/json" \
  -d @test-whatsapp.json
```

**Sistema pronto para receber leads da sua landing page!** 🎉
