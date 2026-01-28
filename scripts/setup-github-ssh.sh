#!/bin/bash

# This script helps set up SSH keys for GitHub Actions deployment
# Run this on your LOCAL machine

echo "================================================"
echo "GitHub Actions SSH Setup for LakeCity Deployment"
echo "================================================"

KEY_PATH="$HOME/.ssh/github_lakecity_deploy"

# Check if key already exists
if [ -f "$KEY_PATH" ]; then
    echo "⚠️  Key already exists at $KEY_PATH"
    read -p "Do you want to use the existing key? (y/n): " use_existing
    if [ "$use_existing" != "y" ]; then
        echo "Creating new key..."
        rm -f "$KEY_PATH" "$KEY_PATH.pub"
    fi
fi

# Generate new key if needed
if [ ! -f "$KEY_PATH" ]; then
    echo "Generating new SSH key..."
    ssh-keygen -t rsa -b 4096 -f "$KEY_PATH" -N "" -C "github-actions-lakecity"
    echo "✓ SSH key generated"
fi

echo ""
echo "================================================"
echo "STEP 1: Add this PUBLIC KEY to your VM"
echo "================================================"
echo ""
cat "$KEY_PATH.pub"
echo ""
echo "On your VM, run:"
echo "  mkdir -p ~/.ssh && chmod 700 ~/.ssh"
echo "  echo '$(cat $KEY_PATH.pub)' >> ~/.ssh/authorized_keys"
echo "  chmod 600 ~/.ssh/authorized_keys"
echo ""
read -p "Press Enter after adding the key to VM..."

echo ""
echo "================================================"
echo "STEP 2: Test SSH connection"
echo "================================================"
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no unirooms_in@34.100.170.102 "echo '✓ SSH connection successful!'"

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "STEP 3: Add PRIVATE KEY to GitHub Secrets"
    echo "================================================"
    echo ""
    echo "Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions"
    echo ""
    echo "Update or create secret: VM_SSH_PRIVATE_KEY"
    echo ""
    echo "Copy the ENTIRE private key below (including BEGIN/END lines):"
    echo "================================================"
    cat "$KEY_PATH"
    echo "================================================"
    echo ""
    echo "✓ Setup complete! GitHub Actions should now work."
else
    echo ""
    echo "❌ SSH connection failed. Please check:"
    echo "1. Public key was added correctly to VM"
    echo "2. VM is accessible at 34.100.170.102"
    echo "3. Username is 'unirooms_in'"
fi
