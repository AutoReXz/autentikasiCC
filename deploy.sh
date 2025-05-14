#!/bin/bash
# Deployment script for frontend and backend in GCP

# Color codes for prettier output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Notes App Deployment Script =====${NC}"
echo "This script helps deploy the Notes App to Google Cloud Platform"

# Ask for the GCP project ID
echo -e "${YELLOW}Enter your GCP Project ID:${NC}"
read PROJECT_ID

# Check if PROJECT_ID is empty
if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}Error: Project ID cannot be empty${NC}"
  exit 1
fi

# Ask for the backend URL (Cloud Run)
echo -e "${YELLOW}Enter the Backend URL (Cloud Run, e.g., https://notes-app-123456789.us-central1.run.app):${NC}"
read BACKEND_URL

# Check if BACKEND_URL is empty
if [ -z "$BACKEND_URL" ]; then
  echo -e "${RED}Error: Backend URL cannot be empty${NC}"
  exit 1
fi

# Ask for the frontend URL (App Engine)
echo -e "${YELLOW}Enter the Frontend URL (App Engine, e.g., https://fe-galang-dot-my-project-id.uc.r.appspot.com):${NC}"
read FRONTEND_URL

# Check if FRONTEND_URL is empty
if [ -z "$FRONTEND_URL" ]; then
  echo -e "${RED}Error: Frontend URL cannot be empty${NC}"
  exit 1
fi

# Deploy backend
echo -e "${GREEN}Deploying backend to Cloud Run...${NC}"
gcloud builds submit --config=cloudbuild.backend.yaml --substitutions=_FRONTEND_URL="$FRONTEND_URL",_PROJECT_ID="$PROJECT_ID" .

# Check if backend deployment was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Backend deployment successful!${NC}"
else
  echo -e "${RED}Backend deployment failed!${NC}"
  exit 1
fi

# Wait a bit before deploying frontend
echo -e "${YELLOW}Waiting for backend services to initialize...${NC}"
sleep 10

# Deploy frontend
echo -e "${GREEN}Deploying frontend to App Engine...${NC}"
gcloud builds submit --config=cloudbuild.frontend.yaml --substitutions=_BACKEND_URL="$BACKEND_URL",_PROJECT_ID="$PROJECT_ID" .

# Check if frontend deployment was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Frontend deployment successful!${NC}"
else
  echo -e "${RED}Frontend deployment failed!${NC}"
  exit 1
fi

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Frontend URL: ${YELLOW}$FRONTEND_URL${NC}"
echo -e "Backend URL: ${YELLOW}$BACKEND_URL${NC}"
echo -e "${GREEN}Please allow a few minutes for services to fully initialize.${NC}"

# Print testing instructions
echo -e "${GREEN}Testing Instructions:${NC}"
echo -e "1. Open ${YELLOW}$FRONTEND_URL${NC} in your browser"
echo -e "2. Check browser console for any errors (F12 > Console)"
echo -e "3. Test the health endpoint directly: ${YELLOW}$BACKEND_URL/health${NC}"
echo -e "4. If connection fails, verify CORS settings and URLs in environment variables"

exit 0
