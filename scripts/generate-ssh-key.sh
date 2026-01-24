#!/bin/bash

# Script to generate SSH keys for GitHub Actions deployment

set -e

echo "🔐 Generating SSH key pair for GitHub Actions..."

# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh

# Generate SSH key
ssh-keygen -t ed25519 -C "github-actions-lakecity" -f ~/.ssh/lakecity_deploy -N ""

echo ""
echo "✅ SSH key pair generated!"
echo ""
echo "📋 Public key (add this to your VM ~/.ssh/authorized_keys):"
echo "════════════════════════════════════════════════════════════"
cat ~/.ssh/lakecity_deploy.pub
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🔒 Private key (add this to GitHub Secrets as VM_SSH_PRIVATE_KEY):"
echo "════════════════════════════════════════════════════════════"
cat ~/.ssh/lakecity_deploy
echo "════════════════════════════════════════════════════════════"
echo ""
echo "⚠️  IMPORTANT: Keep the private key secure and never commit it to git!"
