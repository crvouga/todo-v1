# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm install

# Copy source code
COPY . .

# Build the Vue.js frontend
RUN npm run build-only

# Build the TypeScript server
RUN npx tsc --build tsconfig.server.json

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/build ./build

# Install wget for healthcheck
RUN apk add --no-cache wget

# Set port environment variable
ENV PORT=80

# Expose port 80
EXPOSE 80

# Healthcheck (using wget which is available in Alpine)
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start the server
CMD ["node", "build/src/main.server.js"]
