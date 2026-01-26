#!/bin/bash

# LakeCity Local Development Setup Script
# This script automates the setup of your local development environment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

print_header "🚀 LakeCity Local Development Setup"

# Check prerequisites
print_header "📋 Checking Prerequisites"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed. Please install npm."
    exit 1
fi

# Check Java (optional for AI backend)
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    print_success "Java is installed: $JAVA_VERSION"
    HAS_JAVA=true
else
    print_warning "Java is not installed. AI backend will be skipped."
    print_info "Install Java 17+ from https://adoptium.net/ if you need AI features."
    HAS_JAVA=false
fi

# Setup Server
print_header "🔧 Setting Up Server (Node.js/Express)"

cd "$PROJECT_ROOT/server"

# Check if .env exists
if [ ! -f ".env" ]; then
    print_info "Creating server .env file from template..."
    cp .env.example .env
    print_warning "Please edit server/.env and configure your settings:"
    print_info "  - MONGO_URI: Your MongoDB connection string"
    print_info "  - JWT_SECRET: A secure random string (min 32 chars)"
    print_info "  - INTERNAL_JWT_SECRET: Another secure random string (min 32 chars)"
    print_info ""
    read -p "Press Enter after you've updated server/.env file..."
else
    print_success ".env file already exists"
fi

# Install server dependencies
print_info "Installing server dependencies..."
npm install
print_success "Server dependencies installed"

# Setup Client
print_header "🎨 Setting Up Client (React/Vite)"

cd "$PROJECT_ROOT/client"

# Check if .env exists
if [ ! -f ".env" ]; then
    print_info "Creating client .env file..."
    cat > .env << 'EOF'
VITE_API_URL=http://localhost:8080
VITE_AI_API_URL=http://localhost:5000
EOF
    print_success "Created client/.env file"
else
    print_success ".env file already exists"
fi

# Install client dependencies
print_info "Installing client dependencies..."
npm install
print_success "Client dependencies installed"

# Setup AI Backend (if Java is available)
if [ "$HAS_JAVA" = true ]; then
    print_header "🤖 Setting Up AI Backend (Spring Boot) - Optional"
    
    read -p "Do you want to set up the AI backend? (y/N): " setup_ai
    if [[ $setup_ai =~ ^[Yy]$ ]]; then
        cd "$PROJECT_ROOT/ai_backend"
        
        # Create application.properties if it doesn't exist
        PROPERTIES_FILE="src/main/resources/application.properties"
        mkdir -p src/main/resources
        
        if [ ! -f "$PROPERTIES_FILE" ]; then
            print_info "Creating application.properties..."
            cat > "$PROPERTIES_FILE" << 'EOF'
server.port=5000
spring.application.name=ai-backend

# JWT Secret (must match INTERNAL_JWT_SECRET in server/.env)
jwt.secret=change_this_to_match_server_internal_jwt_secret

# Node.js backend URL
backend.url=http://localhost:8080
EOF
            print_warning "Please edit ai_backend/src/main/resources/application.properties"
            print_info "  - Ensure jwt.secret matches INTERNAL_JWT_SECRET from server/.env"
        else
            print_success "application.properties already exists"
        fi
        
        # Build the AI backend
        print_info "Building AI backend (this may take a while)..."
        ./mvnw clean install -DskipTests
        print_success "AI backend built successfully"
    else
        print_info "Skipping AI backend setup"
    fi
fi

# Final instructions
print_header "🎉 Setup Complete!"

echo ""
print_success "Your local development environment is ready!"
echo ""
print_info "To start the application, you need to run these commands in separate terminals:"
echo ""
echo -e "${YELLOW}Terminal 1 - Start Server:${NC}"
echo "  cd $PROJECT_ROOT/server"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}Terminal 2 - Start Client:${NC}"
echo "  cd $PROJECT_ROOT/client"
echo "  npm run dev"
echo ""

if [ "$HAS_JAVA" = true ] && [[ $setup_ai =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Terminal 3 - Start AI Backend (Optional):${NC}"
    echo "  cd $PROJECT_ROOT/ai_backend"
    echo "  ./mvnw spring-boot:run"
    echo ""
fi

print_info "Once all services are running, open: ${GREEN}http://localhost:5173${NC}"
echo ""
print_info "For more details, see LOCAL_SETUP.md"
echo ""

# Ask if user wants to start services now
read -p "Would you like to start all services now? (y/N): " start_now
if [[ $start_now =~ ^[Yy]$ ]]; then
    print_header "🚀 Starting All Services"
    
    # Create a simple script to run all services
    cat > "$PROJECT_ROOT/start-dev.sh" << 'EOF'
#!/bin/bash
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "🚀 Starting LakeCity Development Servers..."
echo ""

# Start server
echo "📡 Starting Node.js Server..."
cd "$PROJECT_ROOT/server"
npm run dev &
SERVER_PID=$!

# Wait a bit for server to start
sleep 3

# Start client
echo "🎨 Starting React Client..."
cd "$PROJECT_ROOT/client"
npm run dev &
CLIENT_PID=$!

echo ""
echo "✅ All services started!"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all background processes
wait
EOF
    
    chmod +x "$PROJECT_ROOT/start-dev.sh"
    
    print_success "Created start-dev.sh script"
    print_info "Running start-dev.sh..."
    
    exec "$PROJECT_ROOT/start-dev.sh"
else
    print_info "You can start services later using the commands above"
    print_info "Or run: ./start-dev.sh (script created for convenience)"
fi
