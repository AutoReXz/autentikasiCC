FROM node:18-alpine

# Install basic dependencies
RUN apk --no-cache add python3 py3-pip curl bash

# Create Python virtual environment and install Google Cloud Storage
RUN python3 -m venv /venv && \
    /venv/bin/pip install --no-cache-dir google-cloud-storage

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Copy startup script
COPY fetch-env.sh /usr/src/app/fetch-env.sh
RUN chmod +x /usr/src/app/fetch-env.sh

# Expose the port the app runs on
EXPOSE 3000

# Note: Authentication for GCS access is handled automatically by Cloud Run's workload identity
# Command to run the application with env fetching
CMD ["/bin/bash", "-c", "./fetch-env.sh && if [ -f server.js ]; then node server.js; else node app.js; fi"]
