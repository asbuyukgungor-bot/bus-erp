#!/bin/bash

# Set script to exit immediately if a command exits with a non-zero status.
set -e

echo "--- Step 1: Building the frontend application ---"
cd /home/kusadg/bus-erp-project/frontend/bus-erp-ui
npm run build

echo "\n--- Step 2: Moving to the project root directory ---"
cd /home/kusadg/bus-erp-project

echo "\n--- Step 3: Deploying to Firebase Hosting ---"
# This command will use your logged-in gcloud credentials to deploy.
firebase deploy --only hosting

echo "\n--- Deployment Complete! ---"
