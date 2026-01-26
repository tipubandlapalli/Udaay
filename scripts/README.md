# Deployment Scripts

This directory contains scripts for setting up and managing the LakeCity deployment.

## Available Scripts

### 🚀 quick-fix-ssh.sh (RECOMMENDED)
**Purpose:** Quick automated fix for SSH deployment issues

**Usage:**
```bash
./scripts/quick-fix-ssh.sh <VM_IP> <VM_USERNAME>
```

**Example:**
```bash
./scripts/quick-fix-ssh.sh 34.100.170.102 rhd
```

**What it does:**
1. Generates SSH key pair if not exists
2. Copies public key to VM
3. Tests SSH connection
4. Displays private key for GitHub Secrets
5. Checks VM Docker/Docker Compose installation
6. Creates lakecity directory on VM

**When to use:** When GitHub Actions deployment fails with SSH permission errors

---

### 📋 deploy.sh
**Purpose:** Deployment script executed on the VM by GitHub Actions

**Usage:** (Automatically called by GitHub Actions)
```bash
./scripts/deploy.sh
```

**What it does:**
1. Pulls latest Docker images
2. Stops old containers
3. Starts new containers
4. Cleans up old images
5. Shows container status and logs

---

### 🔑 generate-ssh-key.sh
**Purpose:** Generate SSH keys for deployment

**Usage:**
```bash
./scripts/generate-ssh-key.sh
```

**Output:** Creates `~/.ssh/lakecity_deploy_key` and `~/.ssh/lakecity_deploy_key.pub`

---

### 📤 add-ssh-key-to-vm.sh
**Purpose:** Add SSH public key to VM

**Usage:**
```bash
./scripts/add-ssh-key-to-vm.sh <VM_IP> <VM_USERNAME>
```

---

### 🔐 setup-github-secrets.sh
**Purpose:** Guide for setting up GitHub Secrets

**Usage:**
```bash
./scripts/setup-github-secrets.sh
```

**What it does:**
- Lists all required GitHub Secrets
- Shows example values
- Helps encode service account keys

---

### 🖥️ vm-setup.sh
**Purpose:** Initial VM setup (Docker, Docker Compose, etc.)

**Usage:**
```bash
ssh YOUR_USERNAME@YOUR_VM_IP 'bash -s' < ./scripts/vm-setup.sh
```

**What it does:**
1. Updates system packages
2. Installs Docker
3. Installs Docker Compose
4. Configures firewall
5. Creates lakecity directory

---

### 🧪 local-setup.sh
**Purpose:** Setup local development environment

**Usage:**
```bash
./scripts/local-setup.sh
```

**What it does:**
1. Checks Node.js, Java, Maven installations
2. Installs dependencies
3. Sets up environment files
4. Runs tests

---

## Quick Start Guide

### First Time Setup

1. **Run the quick SSH fix:**
   ```bash
   ./scripts/quick-fix-ssh.sh 34.100.170.102 your_username
   ```

2. **Copy the private key output to GitHub Secrets as `VM_SSH_PRIVATE_KEY`**

3. **Set `VM_USER` in GitHub Secrets to your username**

4. **Push to trigger deployment:**
   ```bash
   git add .
   git commit -m "fix: Configure deployment"
   git push origin main
   ```

### Troubleshooting

If deployment fails:

1. **Check SSH connection locally:**
   ```bash
   ssh -i ~/.ssh/lakecity_deploy_key your_username@34.100.170.102
   ```

2. **Verify VM setup:**
   ```bash
   ssh your_username@34.100.170.102
   docker --version
   docker-compose --version
   ls -la ~/lakecity
   ```

3. **Check GitHub Secrets:**
   - Go to GitHub → Settings → Secrets → Actions
   - Verify all required secrets are set (see DEPLOYMENT_SETUP.md)

4. **Review GitHub Actions logs:**
   - GitHub → Actions → Latest workflow run
   - Look for specific error messages

### Manual Deployment

If GitHub Actions is not working, deploy manually:

```bash
# 1. SSH into VM
ssh your_username@34.100.170.102

# 2. Navigate to lakecity directory
cd ~/lakecity

# 3. Pull latest images
docker pull your_dockerhub_username/lakecity-client:latest
docker pull your_dockerhub_username/lakecity-server:latest
docker pull your_dockerhub_username/lakecity-ai-backend:latest

# 4. Deploy
docker-compose down
docker-compose up -d

# 5. Check status
docker-compose ps
docker-compose logs -f
```

## Environment Variables

### GitHub Secrets Required:
- `VM_SSH_PRIVATE_KEY` - Private SSH key for VM access
- `VM_USER` - VM username
- `DOCKER_HUB_USERNAME` - Docker Hub username
- `DOCKER_HUB_PASSWORD` - Docker Hub password
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `GOOGLE_CLOUD_PROJECT_ID` - GCP project ID
- `GOOGLE_CLOUD_BUCKET_NAME` - GCS bucket name
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Base64 encoded service account key
- `GEMINI_PROJECT_ID` - Gemini project ID
- `GEMINI_LOCATION` - Gemini location
- `GEMINI_MODEL` - Gemini model name
- `INTERNAL_JWT_SECRET` - Internal service JWT secret
- `FIREBASE_*` - Firebase credentials (multiple)

See `DEPLOYMENT_SETUP.md` for detailed descriptions and examples.

## Common Commands

```bash
# View logs
ssh user@vm 'cd ~/lakecity && docker-compose logs -f'

# Restart a service
ssh user@vm 'cd ~/lakecity && docker-compose restart service_name'

# Stop all services
ssh user@vm 'cd ~/lakecity && docker-compose down'

# Start all services
ssh user@vm 'cd ~/lakecity && docker-compose up -d'

# Check service status
ssh user@vm 'cd ~/lakecity && docker-compose ps'

# Clean up old images
ssh user@vm 'docker system prune -af'
```

## Documentation

- **DEPLOYMENT_SETUP.md** - Complete setup guide
- **DEPLOYMENT_FIX_SUMMARY.md** - Recent fixes and troubleshooting
- **README.md** - Project overview

## Need Help?

1. Check the logs: `docker-compose logs -f`
2. Review GitHub Actions workflow runs
3. Verify all secrets are set correctly
4. Ensure VM has Docker and Docker Compose installed
5. Check VM firewall rules
6. Verify service account keys are present on VM
