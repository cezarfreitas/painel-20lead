# Multi-stage build for LeadHub

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S leadhub -u 1001

# Copy built application from builder stage
COPY --from=builder --chown=leadhub:nodejs /app/dist ./dist
COPY --from=builder --chown=leadhub:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=leadhub:nodejs /app/package*.json ./

# Copy server files
COPY --chown=leadhub:nodejs server ./server
COPY --chown=leadhub:nodejs shared ./shared

# Set environment variables
ENV NODE_ENV=production
ENV PORT=80

# Expose port
EXPOSE 80

# Switch to non-root user
USER leadhub

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --input-type=module --eval="import('http').then(h => h.get('http://localhost:8080/api/health', r => r.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1)))"

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
