# LeadHub Production - Porta 80
FROM node:18-alpine

WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Try to build (optional)
RUN npm run build || echo "Build failed, will run from source"

# Environment for port 80
ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/api/health || exit 1

# Start directly with tsx
CMD ["npx", "tsx", "server/production.ts"]
