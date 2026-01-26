#!/bin/bash

# Simple script to start all development servers
# Run this after you've completed the setup

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "🚀 Starting LakeCity Development Servers..."
echo ""

# Start server
echo "📡 Starting Node.js Server on port 8080..."
cd "$PROJECT_ROOT/server"
npm run dev > /tmp/lakecity-server.log 2>&1 &
SERVER_PID=$!

# Wait a bit for server to start
sleep 3

# Start client
echo "🎨 Starting React Client on port 5173..."
cd "$PROJECT_ROOT/client"
npm run dev > /tmp/lakecity-client.log 2>&1 &
CLIENT_PID=$!

# Wait a bit for client to start
sleep 3

echo ""
echo "✅ All services started!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Frontend:  http://localhost:5173"
echo "🔌 Backend:   http://localhost:8080"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Logs:"
echo "   Server: tail -f /tmp/lakecity-server.log"
echo "   Client: tail -f /tmp/lakecity-client.log"
echo ""
echo "⚠️  Press Ctrl+C to stop all services"
echo ""

# Wait for all background processes
wait
