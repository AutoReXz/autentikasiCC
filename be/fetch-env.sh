#!/bin/bash
# Script to download .env file from GCS bucket and apply it

# Configuration
BUCKET_NAME=${ENV_BUCKET_NAME:-"my-env-bucket"}
ENV_FILE_PATH=${ENV_FILE_PATH:-"config/.env"}
LOCAL_ENV_PATH=".env"

echo "Attempting to fetch environment file from gs://${BUCKET_NAME}/${ENV_FILE_PATH}..."

# Using Python Google Cloud Storage client
echo "Using Python client to download environment file..."
/venv/bin/python3 -c "
import os
from google.cloud import storage
try:
    storage_client = storage.Client()
    bucket = storage_client.get_bucket('${BUCKET_NAME}')
    blob = bucket.blob('${ENV_FILE_PATH}')
    blob.download_to_filename('${LOCAL_ENV_PATH}')
    print('Successfully downloaded .env file from GCS bucket')
except Exception as e:
    print(f'Error downloading .env file: {e}. Using local .env if available.')
"

# Verify if the env file was downloaded
if [ -f ${LOCAL_ENV_PATH} ]; then
    echo "Environment file loaded successfully."
else
    echo "Warning: No environment file found. Application may use default values."
fi
