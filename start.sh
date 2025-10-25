#!/bin/bash

# ==============================================================================
# Building Survey - Start Script
# ==============================================================================
# This script starts all Docker containers for the Building Survey application
# ==============================================================================

set -e

echo "🚀 Starting Building Survey..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo ""
    echo "Please create .env file from .env.docker.example:"
    echo "  cp .env.docker.example .env"
    echo "  nano .env"
    echo ""
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed!"
    echo ""
    echo "Please install Docker first:"
    echo "  https://docs.docker.com/engine/install/"
    echo ""
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed!"
    echo ""
    echo "Please install Docker Compose first:"
    echo "  https://docs.docker.com/compose/install/"
    echo ""
    exit 1
fi

# Start containers
echo "📦 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ Building Survey started successfully!"
    echo ""
    echo "Services:"
    echo "  📊 Application:  http://localhost:3000"
    echo "  🗄️  PostgreSQL:   localhost:5432"
    echo "  🔧 Setup (first time): http://localhost:8080"
    echo ""
    echo "Next steps:"
    echo "  1. If first time: Open http://localhost:8080 to create admin user"
    echo "  2. Configure reverse proxy (see INSTALL.md)"
    echo "  3. Access application at your domain"
    echo ""
    echo "Useful commands:"
    echo "  ./stop.sh     - Stop all containers"
    echo "  ./logs.sh     - View application logs"
    echo "  ./rebuild.sh  - Rebuild after code changes"
    echo ""
else
    echo ""
    echo "❌ Error: Some containers failed to start!"
    echo ""
    echo "Check logs with:"
    echo "  docker-compose logs"
    echo ""
    exit 1
fi
