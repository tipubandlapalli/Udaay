#!/bin/bash

# Quick setup script using GitHub CLI
# Make sure you're logged in with: gh auth login

set -e

echo "🔐 Setting up GitHub Secrets..."

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found. Install it first:"
    echo "   https://cli.github.com/"
    exit 1
fi

# Set repository
REPO="rohitdeka-1/Udaay"

echo "Enter your Docker Hub username:"
read DOCKER_USERNAME

echo "Enter your Docker Hub password:"
read -s DOCKER_PASSWORD

echo ""
echo "Enter your VM username (usually your GCP email username):"
read VM_USER

echo ""
echo "Adding secrets to GitHub..."

# Docker Hub
gh secret set DOCKER_HUB_USERNAME -b"$DOCKER_USERNAME" -R $REPO
gh secret set DOCKER_HUB_PASSWORD -b"$DOCKER_PASSWORD" -R $REPO

# VM SSH
gh secret set VM_USER -b"$VM_USER" -R $REPO
gh secret set VM_SSH_PRIVATE_KEY < ~/.ssh/lakecity_deploy -R $REPO

# Environment variables from server/.env
if [ -f "server/.env" ]; then
    source server/.env
    
    gh secret set MONGO_URI -b"$MONGO_URI" -R $REPO
    gh secret set JWT_SECRET -b"$JWT_SECRET" -R $REPO
    gh secret set GOOGLE_MAPS_API_KEY -b"$GOOGLE_MAPS_API_KEY" -R $REPO
    gh secret set GOOGLE_CLOUD_PROJECT_ID -b"$GOOGLE_CLOUD_PROJECT_ID" -R $REPO
    gh secret set GOOGLE_CLOUD_BUCKET_NAME -b"$GOOGLE_CLOUD_BUCKET_NAME" -R $REPO
    gh secret set INTERNAL_JWT_SECRET -b"$INTERNAL_JWT_SECRET" -R $REPO
    
    # Gemini settings
    gh secret set GEMINI_PROJECT_ID -b"$GOOGLE_CLOUD_PROJECT_ID" -R $REPO
    gh secret set GEMINI_LOCATION -b"us-central1" -R $REPO
    gh secret set GEMINI_MODEL -b"gemini-1.5-flash-002" -R $REPO
    
    echo "✅ Environment variables added from server/.env"
else
    echo "⚠️  server/.env not found. You'll need to add these secrets manually:"
    echo "   - MONGO_URI"
    echo "   - JWT_SECRET"
    echo "   - GOOGLE_MAPS_API_KEY"
    echo "   - GOOGLE_CLOUD_PROJECT_ID"
    echo "   - GOOGLE_CLOUD_BUCKET_NAME"
    echo "   - INTERNAL_JWT_SECRET"
    echo "   - GEMINI_PROJECT_ID"
    echo "   - GEMINI_LOCATION"
    echo "   - GEMINI_MODEL"
fi

# Service account key (base64 encoded)
if [ -f "server/config/service-account-key.json" ]; then
    SERVICE_KEY=$(base64 -w 0 server/config/service-account-key.json)
    gh secret set GOOGLE_SERVICE_ACCOUNT_KEY -b"$SERVICE_KEY" -R $REPO
    echo "✅ Service account key added"
else
    echo "⚠️  Service account key not found at server/config/service-account-key.json"
fi

echo ""
echo "✅ GitHub Secrets setup complete!"
echo ""
echo "View secrets at: https://github.com/$REPO/settings/secrets/actions"
