# GCP Cloud Build Connection Troubleshooting Guide

## Common Issues and Solutions

### Frontend to Backend Connection Issues

1. **CORS Errors**
   - **Symptom**: Browser console shows CORS errors like "Access to XMLHttpRequest has been blocked by CORS policy"
   - **Solution**: 
     - Verify the `FRONTEND_URL` in backend environment is set correctly
     - Check that backend CORS configuration includes your frontend URL
     - Try temporarily setting CORS to allow all origins (`*`) for testing

2. **URL Configuration Issues**
   - **Symptom**: Connection attempts fail, console shows "Failed to fetch" or similar
   - **Solution**:
     - Verify the `BACKEND_URL` is correct in frontend config.js
     - Make sure URLs don't have trailing slashes causing path issues
     - Check that the URL protocol matches (https to https)

3. **Health Endpoint Not Available**
   - **Symptom**: Health check fails with 404 Not Found
   - **Solution**:
     - Manually test backend health endpoints:
       - `https://your-backend-url/health`
       - `https://your-backend-url/api/health`
       - `https://your-backend-url/` (root path)
     - Check server.js to ensure health endpoints are properly configured

4. **Environment Variables Not Applied**
   - **Symptom**: Environment variables not available in deployed application
   - **Solution**:
     - For Cloud Run, check environment variables in GCP Console
     - For App Engine, verify env_variables section in app.yaml
     - Use console.log to debug environment variable values

5. **Cloud Run Service Unavailable**
   - **Symptom**: Backend returns 500 or is unreachable
   - **Solution**:
     - Check Cloud Run logs in GCP Console
     - Verify the service is deployed and running
     - Check for any startup errors in the container

## Debugging Tools

### For Frontend Issues

1. **Browser Developer Console**
   - Open developer tools (F12)
   - Check the Console tab for JavaScript errors
   - Check the Network tab for failed HTTP requests
   - Look for CORS errors or connection failures

2. **App Engine Logs**
   - View logs in GCP Console > App Engine > Versions > Logs

### For Backend Issues

1. **Cloud Run Logs**
   - View logs in GCP Console > Cloud Run > your-service > Logs

2. **Manual API Testing**
   - Use curl or Postman to test API endpoints directly:
   ```
   curl -v https://your-backend-url/health
   ```

## Quick Fixes

1. **Redeploy with Updated Environment Variables**
   - Update environment variables in Cloud Build YAML files
   - Redeploy using the provided deployment scripts

2. **Verify Static Files**
   - Make sure config.js is properly deployed and accessible
   - Check that API URLs are correct in the deployed config.js

3. **Check Firewall Rules**
   - Ensure GCP firewall allows traffic to your services
   - Verify that App Engine can communicate with Cloud Run

4. **Connection Retry Logic**
   - The updated code includes retry logic for connection attempts
   - Check browser console for detailed connection logs

## Testing Cloud Deployment

1. Use the command below to verify your backend health endpoint:
```
curl -v https://your-backend-url/health
```

2. Open browser developer tools before navigating to your frontend URL

3. Look for detailed connection logs in the console output
