FROM node:18-alpine

# Create app directory
WORKDIR /frontend/

# Copy package.json and install dependencies first (for better caching)
COPY package.json /frontend/
RUN npm install

# Copy all frontend files to the container
COPY . /frontend/

# Expose port for the app
EXPOSE 3000

# Set environment variables for production
ENV NODE_ENV=production
# Setting the fixed backend API URL to the specific Cloud Run service
ENV API_URL=http://localhost:3000

# Start the app
CMD ["npm", "start"]
