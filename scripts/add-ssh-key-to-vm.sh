#!/bin/bash

# Script to add SSH public key to GCP VM
# This script helps you add your SSH key to the VM's authorized_keys

set -e

VM_HOST="${VM_HOST:-34.100.170.102}"
VM_USER="${VM_USER:-rohitdeka}"
SSH_KEY="${SSH_KEY:-~/.ssh/lakecity_deploy.pub}"

echo "🔐 Adding SSH key to VM..."
echo ""

# Expand tilde in path
SSH_KEY=$(eval echo "$SSH_KEY")

if [ ! -f "$SSH_KEY" ]; then
    echo "❌ Error: SSH public key not found at $SSH_KEY"
    exit 1
fi

PUBLIC_KEY=$(cat "$SSH_KEY")

echo "📋 Your public key:"
echo "════════════════════════════════════════════════════════════"
echo "$PUBLIC_KEY"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "📝 Instructions to add this key to your VM:"
echo ""
echo "Option 1: Using GCP Console (Recommended)"
echo "  1. Go to https://console.cloud.google.com/compute/instances"
echo "  2. Find your VM instance (IP: $VM_HOST)"
echo "  3. Click 'SSH' button to open browser SSH"
echo "  4. Run these commands on the VM:"
echo ""
echo "     mkdir -p ~/.ssh"
echo "     chmod 700 ~/.ssh"
echo "     echo '$PUBLIC_KEY' >> ~/.ssh/authorized_keys"
echo "     chmod 600 ~/.ssh/authorized_keys"
echo ""
echo "Option 2: Using gcloud CLI"
echo "  gcloud compute instances add-metadata INSTANCE_NAME \\"
echo "    --metadata-from-file ssh-keys=<(echo \"$VM_USER:$PUBLIC_KEY\") \\"
echo "    --zone=YOUR_ZONE"
echo ""
echo "Option 3: Manual copy-paste"
echo "  1. Copy the public key above"
echo "  2. SSH into VM using GCP Console"
echo "  3. Run: mkdir -p ~/.ssh && chmod 700 ~/.ssh"
echo "  4. Run: echo 'PASTE_KEY_HERE' >> ~/.ssh/authorized_keys"
echo "  5. Run: chmod 600 ~/.ssh/authorized_keys"
echo ""

# Try to use gcloud if available
if command -v gcloud &> /dev/null; then
    echo "🔍 Detected gcloud CLI. Attempting to add key via gcloud..."
    echo ""
    
    # Try to get instance name and zone
    INSTANCE_NAME=$(gcloud compute instances list --filter="EXTERNAL_IP:$VM_HOST" --format="value(name)" 2>/dev/null | head -1)
    ZONE=$(gcloud compute instances list --filter="EXTERNAL_IP:$VM_HOST" --format="value(zone)" 2>/dev/null | head -1)
    
    if [ -n "$INSTANCE_NAME" ] && [ -n "$ZONE" ]; then
        echo "Found instance: $INSTANCE_NAME in zone: $ZONE"
        echo ""
        echo "Run this command to add the key:"
        echo "gcloud compute instances add-metadata $INSTANCE_NAME \\"
        echo "  --metadata-from-file ssh-keys=<(echo \"$VM_USER:$PUBLIC_KEY\") \\"
        echo "  --zone=$ZONE"
        echo ""
    else
        echo "⚠️  Could not auto-detect instance name/zone. Please use Option 1 above."
    fi
fi

echo "✅ After adding the key, test the connection with:"
echo "   ssh -i ~/.ssh/lakecity_deploy $VM_USER@$VM_HOST"
echo ""
