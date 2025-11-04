#!/bin/bash

# Migration Execution Script
# This script should be run on the server where Docker is running

set -e

echo "=================================================="
echo "  Data Migration: Supabase → Local PostgreSQL"
echo "=================================================="
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
    echo "❌ ERROR: Docker is not available"
    echo "   Make sure Docker is installed and running"
    exit 1
fi

# Check if containers are running
if ! docker ps | grep -q building-survey-db; then
    echo "❌ ERROR: PostgreSQL container is not running"
    echo "   Start it with: docker-compose up -d postgres"
    exit 1
fi

echo "✅ Docker environment detected"
echo ""

# Copy migration script to container
echo "📦 Copying migration script to container..."
docker cp migrate-smart.js building-survey-app:/app/migrate-smart.js

# Run migration inside container
echo "🚀 Running migration inside container..."
echo ""
docker exec building-survey-app node /app/migrate-smart.js

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Migration completed!"
    echo ""
    echo "🔄 Restarting application..."
    docker-compose restart app
    echo ""
    echo "✅ Done! Your application should now have all the data."
else
    echo ""
    echo "❌ Migration failed with exit code: $EXIT_CODE"
    exit $EXIT_CODE
fi
