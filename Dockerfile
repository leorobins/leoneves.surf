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

# Build the client without TypeScript checks
RUN cd client && npm run build -- --skipTypeCheck

# Create uploads directory
RUN mkdir -p uploads

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"] 