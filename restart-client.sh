#!/bin/bash

# Simple script to restart the client dev server
# Use this after updating environment variables

echo "🔄 Restarting client dev server..."
echo ""

cd "$(dirname "$0")/client"

# Kill any existing Vite processes
echo "Stopping any running Vite processes..."
pkill -f "vite" || true

sleep 1

# Start the client
echo "Starting client on http://localhost:5173..."
npm run dev
