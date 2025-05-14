# Notes App GCP Deployment Script for PowerShell

# Color settings for prettier output
$GREEN = @{ForegroundColor = "Green"}
$YELLOW = @{ForegroundColor = "Yellow"}
$RED = @{ForegroundColor = "Red"}

Write-Host "===== Notes App Deployment Script =====" @GREEN
Write-Host "This script helps deploy the Notes App to Google Cloud Platform"

# Ask for the GCP project ID
Write-Host "Enter your GCP Project ID:" @YELLOW
$PROJECT_ID = Read-Host

# Check if PROJECT_ID is empty
if ([string]::IsNullOrEmpty($PROJECT_ID)) {
    Write-Host "Error: Project ID cannot be empty" @RED
    exit 1
}

# Ask for the backend URL (Cloud Run)
Write-Host "Enter the Backend URL (Cloud Run, e.g., https://notes-app-123456789.us-central1.run.app):" @YELLOW
$BACKEND_URL = Read-Host

# Check if BACKEND_URL is empty
if ([string]::IsNullOrEmpty($BACKEND_URL)) {
    Write-Host "Error: Backend URL cannot be empty" @RED
    exit 1
}

# Ask for the frontend URL (App Engine)
Write-Host "Enter the Frontend URL (App Engine, e.g., https://fe-galang-dot-my-project-id.uc.r.appspot.com):" @YELLOW
$FRONTEND_URL = Read-Host

# Check if FRONTEND_URL is empty
if ([string]::IsNullOrEmpty($FRONTEND_URL)) {
    Write-Host "Error: Frontend URL cannot be empty" @RED
    exit 1
}

# Deploy backend
Write-Host "Deploying backend to Cloud Run..." @GREEN
$backendCmd = "gcloud builds submit --config=cloudbuild.backend.yaml --substitutions=_FRONTEND_URL=""$FRONTEND_URL"",_PROJECT_ID=""$PROJECT_ID"" ."
Write-Host "Executing: $backendCmd"
Invoke-Expression $backendCmd

# Check if backend deployment was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Backend deployment successful!" @GREEN
}
else {
    Write-Host "Backend deployment failed!" @RED
    exit 1
}

# Wait a bit before deploying frontend
Write-Host "Waiting for backend services to initialize..." @YELLOW
Start-Sleep -Seconds 10

# Deploy frontend
Write-Host "Deploying frontend to App Engine..." @GREEN
$frontendCmd = "gcloud builds submit --config=cloudbuild.frontend.yaml --substitutions=_BACKEND_URL=""$BACKEND_URL"",_PROJECT_ID=""$PROJECT_ID"" ."
Write-Host "Executing: $frontendCmd"
Invoke-Expression $frontendCmd

# Check if frontend deployment was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Frontend deployment successful!" @GREEN
}
else {
    Write-Host "Frontend deployment failed!" @RED
    exit 1
}

Write-Host "Deployment complete!" @GREEN
Write-Host "Frontend URL: $FRONTEND_URL" @YELLOW
Write-Host "Backend URL: $BACKEND_URL" @YELLOW
Write-Host "Please allow a few minutes for services to fully initialize." @GREEN

# Print testing instructions
Write-Host "Testing Instructions:" @GREEN
Write-Host "1. Open $FRONTEND_URL in your browser"
Write-Host "2. Check browser console for any errors (F12 > Console)"
Write-Host "3. Test the health endpoint directly: $BACKEND_URL/health"
Write-Host "4. If connection fails, verify CORS settings and URLs in environment variables"

exit 0
