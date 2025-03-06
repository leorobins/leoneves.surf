FROM node:18-alpine

WORKDIR /app

# Install debugging tools
RUN apk add --no-cache curl bash

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy the rest of the application
COPY . .

# Debug: List directories to verify files
RUN ls -la && ls -la client && ls -la shared

# Fix the link-shared.js script to use CommonJS
RUN echo "// CommonJS version for Docker build" > client/link-shared.cjs && \
    cat client/link-shared.js >> client/link-shared.cjs

# Debug: Print shared directory contents
RUN echo "Shared directory contents:" && ls -la shared/

# Build the client with verbose logging
RUN cd client && node link-shared.cjs && npm run build

# Install tsx globally for running TypeScript files directly
RUN npm install -g tsx

# Create uploads directory
RUN mkdir -p uploads

# Expose the port
EXPOSE 3000

# Add a healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Create a startup script with error handling
RUN echo '#!/bin/sh\nset -e\necho "Starting server..."\nexec npx tsx server/index.ts\n' > /app/start.sh && \
    chmod +x /app/start.sh

# Start the application with proper error handling
CMD ["/app/start.sh"] 