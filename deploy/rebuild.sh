#!/bin/bash

# ==============================================================================
# Building Survey - Rebuild Script
# ==============================================================================
# This script rebuilds and restarts the application after code changes
# ==============================================================================

set -e

echo "🔨 Rebuilding Building Survey..."
echo ""

# Stop containers
echo "1️⃣  Stopping containers..."
docker-compose down

# Rebuild app container
echo ""
echo "2️⃣  Rebuilding app container..."
docker-compose build --no-cache app

# Start containers
echo ""
echo "3️⃣  Starting containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ Rebuild successful!"
    echo ""
    echo "Application is running at: http://localhost:3000"
    echo ""
    echo "View logs: ./logs.sh"
    echo ""
else
    echo ""
    echo "❌ Error: Containers failed to start after rebuild!"
    echo ""
    echo "Check logs with:"
    echo "  docker-compose logs"
    echo ""
    exit 1
fi
