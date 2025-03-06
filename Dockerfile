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

# Create a symlink for the shared directory in client's node_modules
RUN mkdir -p client/node_modules/@shared && \
    cp -r shared/* client/node_modules/@shared/

# Build the client
RUN cd client && npm run build

# Install tsx globally for running TypeScript files directly
RUN npm install -g tsx

# Create uploads directory
RUN mkdir -p uploads

# Expose the port
EXPOSE 3000

# Start the application using tsx to run TypeScript directly
CMD ["npx", "tsx", "server/index.ts"] 