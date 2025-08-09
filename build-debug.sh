#!/bin/bash

echo "🔍 LeadHub Build Diagnostics"
echo "=================================="

echo "📁 Current directory:"
pwd

echo "📋 Directory contents:"
ls -la

echo "🐳 Docker version:"
docker --version

echo "📦 Package.json scripts:"
if [ -f "package.json" ]; then
    grep -A 10 '"scripts"' package.json
else
    echo "❌ package.json not found!"
fi

echo "🔧 Dockerfile exists:"
if [ -f "Dockerfile" ]; then
    echo "✅ Dockerfile found"
    echo "First 10 lines:"
    head -10 Dockerfile
else
    echo "❌ Dockerfile not found!"
fi

echo "🚫 .dockerignore exists:"
if [ -f ".dockerignore" ]; then
    echo "✅ .dockerignore found"
else
    echo "❌ .dockerignore not found!"
fi

echo "🔍 Node modules:"
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
else
    echo "❌ node_modules not found - run npm install"
fi

echo "=================================="
echo "🚀 Ready to build? Try:"
echo "docker build -t leadhub ."
