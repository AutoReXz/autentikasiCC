FROM node:18-alpine

# Create app directory
WORKDIR /frontend/

# Copy package.json and install dependencies first (for better caching)
COPY package.json /frontend/
RUN npm install

# Copy all frontend files to the container
COPY . /frontend/

# Expose port for the app (using PORT environment variable)
EXPOSE 8080

# Set environment variables for production
ENV NODE_ENV=production
# Setting the backend API URL to the Cloud Run service
ENV BACKEND_URL=https://notes-app-263444552508.us-central1.run.app
# Exposing port for App Engine
ENV PORT=8080

# Build and prepare for cloud deployment
RUN npm run build

# Start the optimized cloud server
CMD ["node", "cloud-server.js"]
