# Use full Node.js 20 Debian image for native C++ SQLite compatibility
FROM node:20-bookworm

# Set working directory
WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Clean install dependencies and ensure better-sqlite3 native bindings are built for Linux
RUN npm ci

# Copy application source
COPY . .

# Rebuild native modules for target architecture
RUN npm rebuild better-sqlite3

# Build frontend production bundle
RUN npm run build

# Expose port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["node", "server/server.js"]
