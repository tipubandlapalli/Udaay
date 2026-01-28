#!/bin/bash

# Setup Let's Encrypt SSL certificate for production
# Prerequisites:
# 1. You need a domain name (e.g., api.lakecity.com)
# 2. Point your domain's A record to 34.100.170.102
# 3. Replace DOMAIN_NAME below with your actual domain

DOMAIN_NAME="your-domain.com"  # CHANGE THIS!

echo "Installing Certbot..."
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

echo "Obtaining SSL certificate for $DOMAIN_NAME..."
sudo certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email your-email@example.com

echo "Certificate installed! Certbot will auto-renew."
echo "Update your Vercel VITE_API_URL to: https://$DOMAIN_NAME/api"
