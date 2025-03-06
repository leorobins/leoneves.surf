FROM node:18-alpine

WORKDIR /app

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

# Build the client (the prebuild script will run link-shared.js)
RUN cd client && node link-shared.cjs && npm run build

# Install tsx globally for running TypeScript files directly
RUN npm install -g tsx

# Create uploads directory
RUN mkdir -p uploads

# Expose the port
EXPOSE 3000

# Start the application using tsx to run TypeScript directly
CMD ["npx", "tsx", "server/index.ts"] 