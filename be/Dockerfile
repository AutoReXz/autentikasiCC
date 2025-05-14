FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Add a script to check health endpoint on startup
RUN echo '#!/bin/sh\necho "Starting backend server..."\nif [ -f server.js ]; then\n  echo "Using server.js"\n  node server.js\nelse\n  echo "Using app.js"\n  node app.js\nfi' > start.sh && chmod +x start.sh

# Create a healthcheck script
RUN echo '#!/bin/sh\necho "Backend environment:"\necho "NODE_ENV=$NODE_ENV"\necho "PORT=$PORT"\necho "FRONTEND_URL=$FRONTEND_URL"\necho "Health endpoints available at: /health and /api/health"' > healthcheck.sh && chmod +x healthcheck.sh

# Expose the port the app runs on
EXPOSE 3000

# Run healthcheck on startup then start the server
CMD ["/bin/sh", "-c", "./healthcheck.sh && ./start.sh"]
