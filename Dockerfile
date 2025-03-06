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

# Create a startup script with error handling - using explicit path and content
RUN printf '#!/bin/sh\nset -e\necho "Starting server..."\ncd /app\nexec npx tsx server/index.ts\n' > /app/start.sh && \
    chmod +x /app/start.sh && \
    ls -la /app/start.sh && \
    cat /app/start.sh

# Add a healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application directly as a fallback in case the script isn't found
CMD ["/bin/sh", "-c", "if [ -f /app/start.sh ]; then /app/start.sh; else cd /app && npx tsx server/index.ts; fi"] 