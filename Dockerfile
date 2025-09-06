# Minimal Dockerfile for Railway
FROM node:20-alpine

# Install only essential dependencies
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies, skip optional packages
RUN npm ci --only=production --no-optional --ignore-scripts

# Copy application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# Expose port
EXPOSE 8080

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]
