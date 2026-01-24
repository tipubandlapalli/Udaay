# 🚀 Quick Start - CI/CD Deployment

## Step 1: Generate SSH Keys (Already Done! ✅)
Your SSH keys have been generated:
- **Public key**: Copy from terminal output above
- **Private key**: Will be added to GitHub Secrets

## Step 2: First, Create a Docker Hub Account
1. Go to https://hub.docker.com
2. Sign up for free
3. Remember your username and password

## Step 3: Setup GitHub Secrets (Automated)

**Option A - Automated (Recommended):**
```bash
./scripts/setup-github-secrets.sh
```

**Option B - Manual:**
Go to https://github.com/rohitdeka-1/Udaay/settings/secrets/actions and add each secret manually.

## Step 4: Setup Your VM

```bash
# SSH into your VM
gcloud compute ssh instance-20260124-073036-lakecity --zone=asia-south1-c

# Copy and paste this one-liner:
curl -o setup.sh https://raw.githubusercontent.com/rohitdeka-1/Udaay/main/scripts/vm-setup.sh && chmod +x setup.sh && ./setup.sh

# After script completes, log out and back in
exit

# SSH back in
gcloud compute ssh instance-20260124-073036-lakecity --zone=asia-south1-c

# Add the public key (paste the ssh-ed25519 line from Step 1)
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIH4JWreWN+kUXWnwkDZf96yDQg/hXGfQhuLbArtv4oT4 github-actions-lakecity" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Create directories
mkdir -p ~/lakecity/server/config
mkdir -p ~/lakecity/ai_backend/config

# Upload service account keys (from your local machine)
exit  # Exit VM first
```

## Step 5: Upload Service Account Keys

From your local terminal:
```bash
# Upload to server
gcloud compute scp server/config/service-account-key.json \
  instance-20260124-073036-lakecity:~/lakecity/server/config/ \
  --zone=asia-south1-c

# Upload to ai_backend
gcloud compute scp server/config/service-account-key.json \
  instance-20260124-073036-lakecity:~/lakecity/ai_backend/config/ \
  --zone=asia-south1-c
```

## Step 6: Deploy!

```bash
# Add all changes
git add .

# Commit
git commit -m "Add Docker CI/CD pipeline"

# Push (this triggers automatic deployment!)
git push origin main
```

## Step 7: Watch It Deploy

1. Go to https://github.com/rohitdeka-1/Udaay/actions
2. Watch the workflow run
3. Once complete, visit http://34.100.170.102

## 🎉 Done!

From now on, just:
```bash
git add .
git commit -m "your changes"
git push origin main
```

And your changes will automatically deploy to production! 🚀

## Troubleshooting

**Check if deployment worked:**
```bash
ssh YOUR_VM_USERNAME@34.100.170.102
cd ~/lakecity
docker-compose ps
docker-compose logs -f
```

**Restart services:**
```bash
cd ~/lakecity
docker-compose restart
```

**View logs:**
```bash
docker-compose logs -f server    # Node.js logs
docker-compose logs -f client    # Frontend logs
docker-compose logs -f ai-backend  # AI backend logs
```
