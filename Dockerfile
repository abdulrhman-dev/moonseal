# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Install dependencies
RUN npm install --frozen-lockfile 2>/dev/null || npm install

# Copy source code
COPY . .

# Build the Vite client
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Install production dependencies only
RUN npm install --frozen-lockfile --production 2>/dev/null || npm install --production

# Copy built client from builder
COPY --from=builder /app/dist ./dist

# Copy server source (tsx will compile it at runtime)
COPY src/server ./src/server

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
