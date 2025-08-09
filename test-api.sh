#!/bin/bash

echo "🧪 Testando API com JSON complexo da landing page..."

# Teste 1: Criar lead com JSON completo
echo "📤 Enviando lead com todos os campos customizados..."
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d @test-api.json \
  | jq .

echo -e "\n\n🔍 Verificando leads criados..."
curl -s http://localhost:3000/api/leads | jq '.leads[0].customData'

echo -e "\n\n📊 Status da API..."
curl -s http://localhost:3000/api/health | jq .
