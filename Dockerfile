# Use Node.js LTS for production
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all source code
COPY . .

# Build TypeScript
RUN npm run build

# ========================
# Production image
# ========================
FROM node:20-alpine AS production

WORKDIR /app

# Copy only built files and package.json for smaller image
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY .env ./

# Install only production dependencies
RUN npm install --production

# Expose port (Cloud Run uses PORT env variable)
EXPOSE 4000

# Set environment variable for Cloud Run port (optional, override by Cloud Run)
ENV PORT=4000

# Start the application
CMD ["node", "dist/main.js"]
