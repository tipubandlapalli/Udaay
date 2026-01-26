# Deployment Setup Guide

## Prerequisites

1. **Google Cloud VM** running Ubuntu with Docker and Docker Compose installed
2. **GitHub Secrets** configured
3. **SSH Access** to the VM

## Step 1: Generate SSH Key (if not already done)

On your local machine:

```bash
# Generate a new SSH key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/lakecity_deploy_key -N ""

# This creates:
# - Private key: ~/.ssh/lakecity_deploy_key
# - Public key: ~/.ssh/lakecity_deploy_key.pub
```

## Step 2: Add SSH Key to VM

Copy the public key to your VM:

```bash
# Replace with your VM IP and username
ssh-copy-id -i ~/.ssh/lakecity_deploy_key.pub YOUR_USERNAME@34.100.170.102
```

Or manually:
```bash
# SSH into your VM
ssh YOUR_USERNAME@34.100.170.102

# Add the public key to authorized_keys
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "YOUR_PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## Step 3: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

### Required Secrets:

1. **VM_SSH_PRIVATE_KEY**: Your private SSH key
   ```bash
   # Get the private key content
   cat ~/.ssh/lakecity_deploy_key
   # Copy the ENTIRE output including -----BEGIN/END----- lines
   ```

2. **VM_USER**: Your VM username (e.g., `rhd` or `ubuntu`)

3. **DOCKER_HUB_USERNAME**: Your Docker Hub username

4. **DOCKER_HUB_PASSWORD**: Your Docker Hub password or access token

5. **MONGO_URI**: MongoDB connection string
   ```
   mongodb+srv://username:password@cluster.mongodb.net/lakecity?retryWrites=true&w=majority
   ```

6. **JWT_SECRET**: Random string for JWT signing
   ```bash
   openssl rand -hex 32
   ```

7. **GOOGLE_MAPS_API_KEY**: Your Google Maps API key

8. **GOOGLE_CLOUD_PROJECT_ID**: Your GCP project ID (e.g., `adroit-lock-485008-d6`)

9. **GOOGLE_CLOUD_BUCKET_NAME**: Your GCS bucket name

10. **GOOGLE_SERVICE_ACCOUNT_KEY**: Base64 encoded service account key
    ```bash
    # Encode your service-key.json file
    base64 -w 0 < service-key.json
    # Or on Mac:
    base64 < service-key.json | tr -d '\n'
    ```

11. **GEMINI_PROJECT_ID**: Your Gemini project ID

12. **GEMINI_LOCATION**: Gemini location (e.g., `us-central1`)

13. **GEMINI_MODEL**: Gemini model name (e.g., `gemini-2.0-flash-001`)

14. **INTERNAL_JWT_SECRET**: JWT secret for inter-service communication
    ```bash
    openssl rand -hex 32
    ```

15. **FIREBASE_PROJECT_ID**: Firebase project ID

16. **FIREBASE_PRIVATE_KEY_ID**: Firebase private key ID

17. **FIREBASE_PRIVATE_KEY**: Firebase private key (with newlines preserved)

18. **FIREBASE_CLIENT_EMAIL**: Firebase client email

19. **FIREBASE_CLIENT_ID**: Firebase client ID

20. **FIREBASE_CERT_URL**: Firebase cert URL

## Step 4: VM Setup

SSH into your VM and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version

# Create lakecity directory
mkdir -p ~/lakecity
cd ~/lakecity

# Test connection
echo "✅ VM setup complete!"
```

## Step 5: Test SSH Connection

From your local machine:

```bash
# Test SSH connection
ssh -i ~/.ssh/lakecity_deploy_key YOUR_USERNAME@34.100.170.102 "echo 'Connection successful!'"
```

## Step 6: Trigger Deployment

### Option 1: Push to main branch
```bash
git add .
git commit -m "Deploy updates"
git push origin main
```

### Option 2: Manual trigger
- Go to GitHub → Actions → Deploy to Google Cloud VM → Run workflow

## Step 7: Verify Deployment

Check the GitHub Actions logs for any errors.

Once deployed, verify services:

```bash
# SSH into VM
ssh YOUR_USERNAME@34.100.170.102

# Check containers
cd ~/lakecity
docker-compose ps

# Check logs
docker-compose logs -f

# Test endpoints
curl http://localhost:80          # Client
curl http://localhost:8080/health # Server
curl http://localhost:5000/actuator/health # AI Backend
```

## Troubleshooting

### SSH Permission Denied

1. **Check VM_SSH_PRIVATE_KEY format:**
   - Must include `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`
   - No extra spaces or characters
   - Must be the private key, not public key

2. **Verify public key on VM:**
   ```bash
   cat ~/.ssh/authorized_keys
   ```

3. **Check SSH key permissions on VM:**
   ```bash
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

### Docker Image Pull Fails

1. **Login to Docker Hub manually:**
   ```bash
   docker login -u YOUR_USERNAME
   ```

2. **Check image names match:**
   ```bash
   echo $DOCKER_HUB_USERNAME
   ```

### Container Won't Start

1. **Check logs:**
   ```bash
   docker-compose logs service_name
   ```

2. **Verify environment variables:**
   ```bash
   cat .env
   ```

3. **Check service account keys:**
   ```bash
   ls -la server/config/
   ls -la ai_backend/config/
   ```

### Health Check Fails

1. **Check if port is accessible:**
   ```bash
   curl http://localhost:8080/health
   ```

2. **Check firewall rules:**
   ```bash
   sudo ufw status
   ```

## Firewall Configuration

If you need to open ports:

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 22/tcp  # SSH

# Enable firewall
sudo ufw enable
```

## Service URLs

After successful deployment:

- **Frontend**: http://34.100.170.102
- **Backend API**: http://34.100.170.102:8080
- **AI Backend**: http://34.100.170.102:5000 (internal only)

## Maintenance Commands

```bash
# View logs
docker-compose logs -f [service_name]

# Restart services
docker-compose restart [service_name]

# Stop all services
docker-compose down

# Start all services
docker-compose up -d

# Update and restart
docker-compose pull
docker-compose up -d

# Clean up
docker system prune -af
```
