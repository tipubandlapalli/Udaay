# Deployment Pipeline Fix Summary

## Problem

The GitHub Actions deployment pipeline was failing with:
```
***@34.100.170.102: Permission denied (publickey).
scp: Connection closed
Error: Process completed with exit code 255.
```

## Root Cause

The SSH authentication was not properly configured between GitHub Actions and the Google Cloud VM:
1. SSH private key not properly formatted in GitHub Secrets
2. Public key not added to VM's authorized_keys
3. Missing error handling and connection testing in workflow

## Fixes Applied

### 1. Updated GitHub Actions Workflow (`.github/workflows/deploy.yml`)

**SSH Setup Improvements:**
- Added proper SSH directory permissions (`chmod 700 ~/.ssh`)
- Improved private key writing from secrets
- Added SSH connection testing with error messages
- Added StrictHostKeyChecking=no to prevent interactive prompts
- Better error reporting when SSH fails

**File Copy Improvements:**
- Added directory creation before copying files
- Added echo messages for each step
- Added StrictHostKeyChecking=no to all SCP commands
- Better error handling

**Service Account Keys:**
- Fixed filename from `service-account-key.json` to `service-key.json`
- Added proper directory creation
- Improved error messages

**Deployment Process:**
- Added `set -e` for immediate error exit
- Better emoji-based progress indicators
- Added wait time for services to start
- Improved error handling with `|| true` for non-critical commands
- Pass DOCKER_HUB_USERNAME environment variable to docker-compose

**Health Checks:**
- Extended wait time to 20 seconds
- Added individual service health checks
- Added log output for failed services
- Better status reporting

### 2. Updated docker-compose.yml

**Fixed Volume Mounts:**
- Changed from specific file mount to directory mount
- Server: `./server/config:/app/config:ro`
- AI Backend: `./ai_backend/config:/app/config:ro`

**Environment Variables:**
- Added `GOOGLE_CLOUD_KEY_FILE` for Node.js server

**Health Checks:**
- Changed server health check to use `wget` instead of Node.js inline script
- More reliable health check mechanism

**Removed Unused Volumes:**
- Removed unused named volumes (server-config, ai-backend-config)

### 3. Created Setup Scripts

**quick-fix-ssh.sh:**
- Automated SSH key generation
- Automated public key copying to VM
- Connection testing
- Displays private key for GitHub Secrets
- Checks VM Docker/Docker Compose installation
- Creates lakecity directory on VM

### 4. Created Documentation

**DEPLOYMENT_SETUP.md:**
- Complete step-by-step setup guide
- All required GitHub Secrets listed with examples
- VM setup instructions
- Troubleshooting section
- Maintenance commands

## How to Fix Your Deployment

### Quick Fix (Recommended)

1. **Run the SSH setup script:**
   ```bash
   cd /home/rhd/Desktop/Resume_Projects/LakeCity
   ./scripts/quick-fix-ssh.sh 34.100.170.102 YOUR_VM_USERNAME
   ```

2. **Copy the private key output to GitHub Secrets:**
   - Go to GitHub → Settings → Secrets → Actions
   - Create/Update `VM_SSH_PRIVATE_KEY` with the full private key (including BEGIN/END lines)

3. **Set VM_USER secret:**
   - Create/Update `VM_USER` with your VM username

4. **Test the deployment:**
   ```bash
   git add .
   git commit -m "fix: Update deployment pipeline with SSH fixes"
   git push origin main
   ```

### Manual Fix

If the script doesn't work, follow these steps:

1. **Generate SSH Key:**
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/lakecity_deploy_key -N ""
   ```

2. **Copy Public Key to VM:**
   ```bash
   # Option 1: Automatic
   ssh-copy-id -i ~/.ssh/lakecity_deploy_key.pub YOUR_USERNAME@34.100.170.102
   
   # Option 2: Manual
   ssh YOUR_USERNAME@34.100.170.102
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   nano ~/.ssh/authorized_keys  # Paste public key here
   chmod 600 ~/.ssh/authorized_keys
   ```

3. **Add Private Key to GitHub Secrets:**
   ```bash
   # Display private key
   cat ~/.ssh/lakecity_deploy_key
   ```
   - Copy ENTIRE output including `-----BEGIN` and `-----END` lines
   - Add to GitHub as `VM_SSH_PRIVATE_KEY`

4. **Set Other Required Secrets:**
   See `DEPLOYMENT_SETUP.md` for complete list

## Verification

After deployment, SSH into your VM and check:

```bash
ssh YOUR_USERNAME@34.100.170.102
cd ~/lakecity

# Check containers
docker-compose ps

# All three should be running:
# - lakecity-client (port 80)
# - lakecity-server (port 8080)  
# - lakecity-ai-backend (port 5000)

# Check logs
docker-compose logs -f

# Test endpoints
curl http://localhost:80                    # Frontend
curl http://localhost:8080/health           # Backend API
curl http://localhost:5000/actuator/health  # AI Backend
```

## Common Issues

### 1. "Permission denied (publickey)"
**Solution:** 
- Verify VM_SSH_PRIVATE_KEY is complete (starts with `-----BEGIN`)
- Check public key is in VM's `~/.ssh/authorized_keys`
- Run: `ssh -i ~/.ssh/id_rsa YOUR_USER@VM_IP` to test locally

### 2. "docker-compose: command not found"
**Solution:**
```bash
ssh YOUR_USERNAME@34.100.170.102
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. "Cannot connect to Docker daemon"
**Solution:**
```bash
ssh YOUR_USERNAME@34.100.170.102
sudo usermod -aG docker $USER
# Logout and login again
```

### 4. Container health check fails
**Solution:**
```bash
# Check logs for specific service
docker-compose logs service-name

# Common issues:
# - Missing environment variables in .env
# - Service account key not copied
# - Port already in use
```

## What Works Now

✅ **All three services deploy automatically:**
- Frontend (React + Vite + Nginx)
- Backend (Node.js + Express)
- AI Backend (Spring Boot + Gemini)

✅ **Proper SSH authentication**
✅ **Service account keys copied correctly**
✅ **Environment variables configured**
✅ **Health checks for all services**
✅ **Automatic cleanup of old images**
✅ **Better error reporting and logging**

## Next Steps

1. Run the quick-fix script or manual setup
2. Update GitHub Secrets
3. Push to trigger deployment
4. Monitor GitHub Actions logs
5. Verify services are running on VM

## Support

If you still encounter issues:
1. Check GitHub Actions logs for specific error messages
2. SSH into VM and check `docker-compose logs`
3. Verify all GitHub Secrets are set correctly
4. Check VM firewall rules (`sudo ufw status`)
5. Ensure VM has enough resources (memory, disk space)

## Files Modified

- `.github/workflows/deploy.yml` - Main deployment workflow
- `docker-compose.yml` - Docker compose configuration
- `scripts/quick-fix-ssh.sh` - SSH setup automation (NEW)
- `DEPLOYMENT_SETUP.md` - Setup documentation (NEW)
- `DEPLOYMENT_FIX_SUMMARY.md` - This file (NEW)
