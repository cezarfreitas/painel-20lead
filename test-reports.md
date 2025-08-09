# 📊 Gráficos de Relatórios - LeadHub

## ✅ Implementado

A página de Relatórios agora possui gráficos dinâmicos baseados nos dados reais dos leads:

### 📈 Gráfico de Fontes (Sources)
- **Tipo**: Gráfico de barras
- **Dados**: Quantidade de leads por fonte de origem
- **Exemplos de fontes**:
  - Landing Page Lojistas
  - Formulário de Contato 
  - Webinar Growth
  - Google Ads
  - Facebook Ads
  - Indicação

### 📊 Gráfico de Status
- **Tipo**: Gráfico de pizza
- **Dados**: Distribuição de leads por status
- **Status disponíveis**:
  - Novos
  - Contatados  
  - Qualificados
  - Convertidos
  - Perdidos

### 📋 Cards de Estatísticas
- Total de Leads
- Leads Novos
- Leads Convertidos
- Taxa de Conversão (%)

### 🕐 Atualização Automática
- Os gráficos são atualizados automaticamente a cada 30 segundos
- Dados em tempo real conectados ao banco de dados

## 🎯 Como Testar

1. **Acesse a página Relatórios**: `/reports`
2. **Crie leads com diferentes fontes**:
   ```bash
   # Exemplo: Lead da Landing Page
   curl -X POST http://localhost:3000/api/leads \
     -H "Content-Type: application/json" \
     -d '{
       "name": "João Silva",
       "phone": "11999999999", 
       "source": "Landing Page Lojistas"
     }'
   
   # Exemplo: Lead do Google Ads
   curl -X POST http://localhost:3000/api/leads \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Maria Santos",
       "phone": "11888888888",
       "source": "Google Ads"
     }'
   ```

3. **Veja os gráficos atualizados**: Os dados aparecerão automaticamente nos gráficos

## 📱 Interface Responsiva

- **Desktop**: 2 gráficos lado a lado
- **Mobile**: Gráficos empilhados verticalmente
- **Cores**: Paleta profissional com 10 cores diferentes

## 🔧 Tecnologias Utilizadas

- **Recharts**: Biblioteca de gráficos React
- **TanStack Query**: Cache e atualização automática de dados
- **Tailwind CSS**: Estilização responsiva
- **TypeScript**: Tipagem forte dos dados

## 📊 Dados de Exemplo

O sistema já vem com dados de exemplo que mostram:
- 3 leads com diferentes fontes
- Status variados (new, contacted, qualified)
- Dados customizados (budget, interesse, etc.)

## 🚀 Próximas Melhorias

- Filtros por período (último mês, semana, etc.)
- Gráficos de evolução temporal
- Métricas de performance de webhooks
- Relatórios exportáveis (PDF/Excel)
