#!/bin/bash

# VM Setup Script - Run this ONCE on your Google Cloud VM
# This installs Docker, Docker Compose, and sets up the environment

set -e

echo "🚀 Setting up Google Cloud VM for LakeCity deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose already installed"
fi

# Create project directory
echo "📁 Creating project directory..."
mkdir -p ~/lakecity/server/config
mkdir -p ~/lakecity/ai_backend/config

# Install additional tools
echo "🛠️  Installing additional tools..."
sudo apt-get install -y git curl wget nano

# Configure firewall (if using UFW)
if command -v ufw &> /dev/null; then
    echo "🔒 Configuring firewall..."
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 22/tcp
    sudo ufw allow 8080/tcp
    sudo ufw allow 5000/tcp
    echo "✅ Firewall configured"
fi

# Enable Docker service
sudo systemctl enable docker
sudo systemctl start docker

echo ""
echo "✅ VM setup completed!"
echo ""
echo "Next steps:"
echo "1. Log out and log back in for Docker group changes to take effect"
echo "2. Add your service account key to ~/lakecity/server/config/service-account-key.json"
echo "3. Add your service account key to ~/lakecity/ai_backend/config/service-account-key.json"
echo "4. The GitHub Actions workflow will handle the rest!"
echo ""
echo "To verify Docker installation:"
echo "  docker --version"
echo "  docker-compose --version"
