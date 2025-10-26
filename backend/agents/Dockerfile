FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY src ./src
COPY .env.example .env

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "src/server.js"]

