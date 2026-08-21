# Use official Node.js LTS runtime
FROM node:20-slim

# Install SQLite dependencies and build tools
RUN apt-get update && apt-get install -y python3 make g++ sqlite3 && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and lock files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy full application code
COPY . .

# Build Vite frontend bundle
RUN npm run build

# Expose production port
EXPOSE 5000

# Environment variables default
ENV NODE_ENV=production
ENV PORT=5000

# Start unified Node.js API + Static SPA server
CMD ["node", "server/server.js"]
