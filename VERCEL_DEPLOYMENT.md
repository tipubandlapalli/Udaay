# Vercel Deployment Guide

## Frontend Deployment on Vercel

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- Vercel CLI installed: `npm i -g vercel`

### Deployment Steps

#### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the `LakeCity` repository

2. **Configure Project**
   - Framework Preset: `Vite`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variables**
   Add these in Project Settings → Environment Variables:
   ```
   VITE_API_URL=http://34.100.170.102
   VITE_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
   VITE_USE_DEV_AUTH=false
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - You'll get a URL like `https://your-app.vercel.app`

#### Option 2: Deploy via CLI

1. **Navigate to client folder**
   ```bash
   cd client
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Add environment variables** (if not already set)
   ```bash
   vercel env add VITE_API_URL production
   vercel env add VITE_GOOGLE_MAPS_API_KEY production
   ```

### After Frontend Deployment

1. **Update GitHub Secrets**
   Add these secrets to your GitHub repository for the backend:
   ```
   CLIENT_URL=https://your-app.vercel.app
   FRONTEND_URL=https://your-app.vercel.app
   ```

2. **Redeploy Backend**
   Push a commit to trigger the backend deployment with updated CORS settings:
   ```bash
   git commit --allow-empty -m "Update CORS for Vercel frontend"
   git push origin main
   ```

## Backend on Google Cloud VM

The backend (server + ai-backend) runs on the VM at:
- **Server API**: http://34.100.170.102 (port 80 and 8080)
- **AI Backend**: http://34.100.170.102:5000 (internal only)

### CORS Configuration
The backend is already configured to accept requests from:
- Any Vercel deployment (`*.vercel.app`)
- Direct VM access
- Localhost (for development)

### Health Check Endpoints
- Server: http://34.100.170.102/health
- Server (alt): http://34.100.170.102:8080/health
- AI Backend: http://34.100.170.102:5000/actuator/health

## Testing the Deployment

1. **Test Backend Health**
   ```bash
   curl http://34.100.170.102/health
   curl http://34.100.170.102:8080/health
   ```

2. **Test Frontend**
   - Open your Vercel URL
   - Check browser console for any API connection errors
   - Try logging in and creating an issue

3. **Test CORS**
   - Open browser DevTools → Network tab
   - Make an API request from your Vercel app
   - Verify no CORS errors appear

## Troubleshooting

### CORS Errors
If you see CORS errors:
1. Check that `CLIENT_URL` and `FRONTEND_URL` secrets are set correctly
2. Verify backend logs: `ssh rhd@34.100.170.102 "cd ~/lakecity && docker-compose logs server"`
3. Ensure the origin matches exactly (including https://)

### Backend Connection Errors
1. Verify VM firewall allows port 80 and 8080
2. Check backend is running: `docker-compose ps`
3. View logs: `docker-compose logs --tail=50 server`

### Environment Variables Not Working
1. Clear Vercel build cache: Settings → Data Cache → Clear
2. Redeploy: `vercel --prod --force`
3. Verify vars are set: Vercel Dashboard → Project → Settings → Environment Variables

## Architecture

```
┌─────────────────┐
│   Vercel CDN    │  Frontend (React + Vite)
│  *.vercel.app   │
└────────┬────────┘
         │ HTTP/HTTPS
         │
         ▼
┌─────────────────┐
│  Google Cloud   │
│   VM (Ubuntu)   │  Backend Services
│ 34.100.170.102  │
├─────────────────┤
│ Port 80/8080    │  Node.js + Express API
│ Port 5000       │  Spring Boot AI Service
└─────────────────┘
         │
         ▼
┌─────────────────┐
│    MongoDB      │  Database
│   (External)    │
└─────────────────┘
```

## Monitoring

### VM Status
```bash
ssh rhd@34.100.170.102
cd ~/lakecity
docker-compose ps
docker-compose logs --tail=100
```

### Vercel Deployments
- Dashboard: https://vercel.com/dashboard
- View build logs and runtime logs
- Check deployment status

## Cost Optimization

- **Vercel**: Free tier includes:
  - 100GB bandwidth/month
  - Unlimited deployments
  - SSL certificates

- **Google Cloud VM**: 
  - Current setup uses standard VM
  - Consider using preemptible VM for cost savings
  - Monitor bandwidth usage

## Security Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use HTTPS in production** - Configure SSL on VM or use Cloudflare
3. **Rotate secrets regularly** - Especially JWT secrets and API keys
4. **Keep dependencies updated** - Run `npm audit` regularly
