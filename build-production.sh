#!/bin/bash

# LeadHub Production Build Script
echo "🚀 Building LeadHub for Production"

# Build Docker image
echo "📦 Building Docker image..."
docker build -t leadhub:latest .

echo "✅ Build completed successfully!"
echo ""
echo "To run in production:"
echo "docker run -d \\"
echo "  --name leadhub-prod \\"
echo "  -p 80:80 \\"
echo "  -e MYSQL_DB=\"mysql://user:pass@host:3306/database\" \\"
echo "  --restart unless-stopped \\"
echo "  leadhub:latest"
echo ""
echo "Health check: curl http://localhost/api/health"
