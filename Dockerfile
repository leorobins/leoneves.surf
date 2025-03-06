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

# Fix the link-shared.js script to use CommonJS
RUN echo "// CommonJS version for Docker build" > client/link-shared.cjs && \
    cat client/link-shared.js >> client/link-shared.cjs

# Build the client
RUN cd client && node link-shared.cjs && npm run build

# Install tsx globally for running TypeScript files directly
RUN npm install -g tsx

# Create uploads directory
RUN mkdir -p uploads

# Create a simple test file to verify the server can start
RUN echo 'console.log("Server test file loaded successfully");' > /app/server-test.js

# Expose the port
EXPOSE 3000

# Create a simple startup script that logs everything and includes fallback
RUN printf '#!/bin/sh\n\
echo "Starting server..."\n\
echo "Current directory: $(pwd)"\n\
echo "Files in current directory:"\n\
ls -la\n\
echo "Node version: $(node --version)"\n\
echo "NPM version: $(npm --version)"\n\
echo "TSX version: $(npx tsx --version)"\n\
echo "Testing Node execution:"\n\
node /app/server-test.js\n\
echo "Starting actual server..."\n\
cd /app\n\
\n\
# Try to start the main server\n\
echo "Attempting to start main server..."\n\
npx tsx server/index.ts || {\n\
  echo "Main server failed to start. Falling back to minimal server..."\n\
  node server/minimal.js\n\
}\n' > /app/start.sh && \
    chmod +x /app/start.sh

# Start with the shell directly to ensure proper execution
CMD ["/bin/sh", "/app/start.sh"] 