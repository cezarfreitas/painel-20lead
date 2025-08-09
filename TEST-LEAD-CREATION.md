# 🔍 Debug do Erro na Criação de Leads

## 🚨 Problema Identificado

O usuário está recebendo erro "Erro interno do servidor" ao tentar criar leads.

## 🔧 Logs Adicionados

Adicionei logs detalhados em:
- `server/routes/leads.ts` - Função `createLead`
- `server/database.ts` - Função `create` do LeadDB

## 🧪 Endpoint de Teste

Criado endpoint `/api/test-lead` para debug específico.

## 🎯 JSON de Teste

```json
{
   "name":"cezar",
   "whatsapp":"11989882867",
   "origem":"Landing Page Lojistas",
   "marca":"Ecko"
}
```

## 🔍 Possíveis Causas

1. **Problema de mapeamento**: `whatsapp` → `phone`
2. **Problema de timestamp**: Conversão de datas
3. **Problema de JSON**: Serialização de customData
4. **Problema de banco**: INSERT SQL

## ✅ Correções Aplicadas

1. **Logs detalhados** para rastrear onde falha
2. **Validação melhorada** de campos obrigatórios
3. **Tratamento de datas** melhorado
4. **Uso correto** das variáveis extraídas

## 🚀 Próximos Passos

Aguardar logs do servidor para identificar exatamente onde está falhando.
