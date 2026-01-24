# 🚀 Docker + GitHub Actions CI/CD Setup Guide

## Overview
This guide sets up automatic deployment to your Google Cloud VM (34.100.170.102) whenever you push code to GitHub.

## Architecture
```
GitHub Push → GitHub Actions → Build Docker Images → Push to Docker Hub → Deploy to VM
```

---

## 🔧 Step 1: Generate SSH Keys

Run this command in your VS Code terminal:

```bash
chmod +x scripts/generate-ssh-key.sh
./scripts/generate-ssh-key.sh
```

This will generate:
- **Public key**: To add to your VM
- **Private key**: To add to GitHub Secrets

---

## 🖥️ Step 2: Setup Your Google Cloud VM

### SSH into your VM:
```bash
gcloud compute ssh instance-20260124-073036-lakecity --zone=asia-south1-c
```

### Run the VM setup script:
```bash
# Download and run the setup script
curl -o setup.sh https://raw.githubusercontent.com/rohitdeka-1/Udaay/main/scripts/vm-setup.sh
chmod +x setup.sh
./setup.sh

# Log out and back in for Docker group changes
exit
```

### SSH back in and add the public key:
```bash
gcloud compute ssh instance-20260124-073036-lakecity --zone=asia-south1-c

# Add the public key from Step 1
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Upload service account keys:
```bash
# On your local machine, upload service account key
gcloud compute scp server/config/service-account-key.json \
  instance-20260124-073036-lakecity:~/lakecity/server/config/ \
  --zone=asia-south1-c

gcloud compute scp server/config/service-account-key.json \
  instance-20260124-073036-lakecity:~/lakecity/ai_backend/config/ \
  --zone=asia-south1-c
```

---

## 🐳 Step 3: Create Docker Hub Account

1. Go to https://hub.docker.com
2. Create a free account
3. Note your username (you'll need it for GitHub Secrets)

---

## 🔐 Step 4: Add GitHub Secrets

Go to your GitHub repo: https://github.com/rohitdeka-1/Udaay/settings/secrets/actions

Click **"New repository secret"** for each:

| Secret Name | Value | Where to get it |
|------------|-------|-----------------|
| `DOCKER_HUB_USERNAME` | Your Docker Hub username | From hub.docker.com |
| `DOCKER_HUB_PASSWORD` | Your Docker Hub password | From hub.docker.com |
| `VM_SSH_PRIVATE_KEY` | The private key from Step 1 | Output of generate-ssh-key.sh |
| `VM_USER` | Your VM username | Usually your GCP email username |
| `MONGO_URI` | MongoDB connection string | From server/.env |
| `JWT_SECRET` | JWT secret | From server/.env |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | From server/.env |
| `GOOGLE_CLOUD_PROJECT_ID` | GCP Project ID | adroit-lock-485008-d6 |
| `GOOGLE_CLOUD_BUCKET_NAME` | Storage bucket name | lakecity-uploads |
| `GEMINI_PROJECT_ID` | Same as GOOGLE_CLOUD_PROJECT_ID | adroit-lock-485008-d6 |
| `GEMINI_LOCATION` | us-central1 | Gemini API region |
| `GEMINI_MODEL` | gemini-1.5-flash-002 | Model name |
| `INTERNAL_JWT_SECRET` | Internal JWT secret | From server/.env |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Base64 encoded service account JSON | See below |

### To get base64 encoded service account key:
```bash
base64 -w 0 server/config/service-account-key.json
```
Copy the entire output and paste as `GOOGLE_SERVICE_ACCOUNT_KEY`

---

## 📝 Step 5: Update docker-compose.yml

The docker-compose.yml uses your Docker Hub username. You need to update it:

```bash
# Replace YOUR_DOCKERHUB_USERNAME with your actual Docker Hub username
# I'll do this for you - just tell me your Docker Hub username
```

---

## 🚀 Step 6: Test Deployment

### Test locally first:
```bash
# Create .env file
cp .env.production .env.production.local
# Edit .env.production.local with your actual values
nano .env.production.local

# Build and run locally
docker-compose up --build
```

Access at http://localhost

### Deploy to GitHub:
```bash
# Add all files
git add .

# Commit changes
git commit -m "Add Docker + CI/CD pipeline"

# Push to GitHub (triggers automatic deployment)
git push origin main
```

---

## 📊 Step 7: Monitor Deployment

1. Go to https://github.com/rohitdeka-1/Udaay/actions
2. Watch the workflow run
3. Check for any errors

Once completed:
- Frontend: http://34.100.170.102
- Backend: http://34.100.170.102:8080
- AI Backend: http://34.100.170.102:5000

---

## 🔍 Troubleshooting

### Check container status:
```bash
ssh your-vm-user@34.100.170.102
cd ~/lakecity
docker-compose ps
docker-compose logs -f
```

### Restart containers:
```bash
cd ~/lakecity
docker-compose restart
```

### View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f ai-backend
```

### Rebuild from scratch:
```bash
cd ~/lakecity
docker-compose down -v
docker-compose up --build -d
```

---

## 🎉 You're Done!

Now every time you push to GitHub:
1. GitHub Actions builds Docker images
2. Images are pushed to Docker Hub
3. VM pulls new images
4. Containers are restarted with new code

**No more manual deployments!** 🚀
