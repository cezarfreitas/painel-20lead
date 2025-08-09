# LeadHub Production Dockerfile
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to avoid conflicts
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create user
RUN adduser -D -s /bin/sh appuser && chown -R appuser:appuser /app

USER appuser

# Environment
ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80

# Simple health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s \
  CMD curl -f http://localhost:80/api/health || exit 1

# Start
CMD ["npm", "start"]
