#!/bin/bash

# Quick SSH Setup Fix Script
# Run this to quickly set up SSH access for GitHub Actions

set -e

echo "🔧 LakeCity Deployment - SSH Setup Fix"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if VM details are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo -e "${RED}Usage: $0 <VM_IP> <VM_USERNAME>${NC}"
    echo "Example: $0 34.100.170.102 rhd"
    exit 1
fi

VM_IP="$1"
VM_USER="$2"
KEY_PATH="$HOME/.ssh/lakecity_deploy_key"

echo "VM IP: $VM_IP"
echo "VM User: $VM_USER"
echo ""

# Step 1: Generate SSH key if it doesn't exist
if [ ! -f "$KEY_PATH" ]; then
    echo -e "${YELLOW}📝 Generating new SSH key...${NC}"
    ssh-keygen -t rsa -b 4096 -f "$KEY_PATH" -N "" -C "lakecity-github-actions"
    echo -e "${GREEN}✅ SSH key generated at $KEY_PATH${NC}"
else
    echo -e "${GREEN}✅ SSH key already exists at $KEY_PATH${NC}"
fi

echo ""

# Step 2: Copy public key to VM
echo -e "${YELLOW}📤 Copying public key to VM...${NC}"
echo "You may need to enter your VM password."
echo ""

ssh-copy-id -i "${KEY_PATH}.pub" "${VM_USER}@${VM_IP}" || {
    echo ""
    echo -e "${RED}❌ Automatic copy failed. Manual setup required:${NC}"
    echo ""
    echo "Run this on your VM:"
    echo "-------------------"
    echo "mkdir -p ~/.ssh"
    echo "chmod 700 ~/.ssh"
    echo "cat >> ~/.ssh/authorized_keys << 'EOFKEY'"
    cat "${KEY_PATH}.pub"
    echo "EOFKEY"
    echo "chmod 600 ~/.ssh/authorized_keys"
    echo "-------------------"
    exit 1
}

echo -e "${GREEN}✅ Public key copied to VM${NC}"
echo ""

# Step 3: Test connection
echo -e "${YELLOW}🧪 Testing SSH connection...${NC}"
if ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "${VM_USER}@${VM_IP}" "echo 'Connection successful!'"; then
    echo -e "${GREEN}✅ SSH connection working!${NC}"
else
    echo -e "${RED}❌ SSH connection failed${NC}"
    exit 1
fi

echo ""

# Step 4: Display GitHub Secret
echo -e "${YELLOW}📋 GitHub Secret Configuration${NC}"
echo "================================"
echo ""
echo -e "${YELLOW}Add this as VM_SSH_PRIVATE_KEY in GitHub Secrets:${NC}"
echo "---------------------------------------------------"
cat "$KEY_PATH"
echo "---------------------------------------------------"
echo ""
echo -e "${YELLOW}Add this as VM_USER in GitHub Secrets:${NC}"
echo "$VM_USER"
echo ""

# Step 5: VM Setup check
echo -e "${YELLOW}🔍 Checking VM setup...${NC}"
ssh -i "$KEY_PATH" "${VM_USER}@${VM_IP}" << 'ENDSSH'
    echo "Checking Docker..."
    if command -v docker &> /dev/null; then
        echo "✅ Docker is installed: $(docker --version)"
    else
        echo "❌ Docker is NOT installed"
        echo "Install with: curl -fsSL https://get.docker.com | sh"
    fi
    
    echo ""
    echo "Checking Docker Compose..."
    if command -v docker-compose &> /dev/null; then
        echo "✅ Docker Compose is installed: $(docker-compose --version)"
    else
        echo "❌ Docker Compose is NOT installed"
        echo "Install with: sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose"
    fi
    
    echo ""
    echo "Checking lakecity directory..."
    if [ -d ~/lakecity ]; then
        echo "✅ lakecity directory exists"
    else
        echo "⚠️ Creating lakecity directory..."
        mkdir -p ~/lakecity
    fi
ENDSSH

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Copy the private key above to GitHub Secrets as VM_SSH_PRIVATE_KEY"
echo "2. Set VM_USER to: $VM_USER"
echo "3. Ensure all other secrets are configured (see DEPLOYMENT_SETUP.md)"
echo "4. Push to main branch or trigger workflow manually"
echo ""
