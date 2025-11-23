#!/bin/bash

# ============================================================================
# Building Survey - Production Deployment Script
# ============================================================================
# This script contains the TESTED and WORKING deployment method
# Branch: claude/hybrid-urls-forms-fix-011CUYznPtNcvNApnP9R5bC1
# Tag: v1.0-working-baseline
# Date: 2025-11-05
# ============================================================================

set -e  # Exit on any error

echo "=================================================="
echo "🚀 Building Survey - Production Deployment"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please create .env file from .env.docker.example"
    exit 1
fi

echo -e "${GREEN}✓${NC} .env file found"

# Step 1: Export environment variables
echo ""
echo "📋 Step 1: Loading environment variables..."
set -a
source .env
set +a
echo -e "${GREEN}✓${NC} Environment variables loaded"

# Step 2: Stop existing containers (without removing volumes!)
echo ""
echo "🛑 Step 2: Stopping existing containers..."
docker-compose down
echo -e "${GREEN}✓${NC} Containers stopped"

# Step 3: Rebuild application (with build args from environment)
echo ""
echo "🔨 Step 3: Building application..."
echo -e "${YELLOW}⚠ This may take several minutes...${NC}"
docker-compose build --no-cache app
echo -e "${GREEN}✓${NC} Application built successfully"

# Step 4: Start all services
echo ""
echo "🚀 Step 4: Starting all services..."
docker-compose up -d
echo -e "${GREEN}✓${NC} Services started"

# Step 5: Wait for services to be healthy
echo ""
echo "⏳ Step 5: Waiting for services to be healthy..."
sleep 5

# Check container status
echo ""
echo "📊 Container Status:"
docker-compose ps

# Step 6: Show logs
echo ""
echo "📝 Recent logs (press Ctrl+C to stop):"
echo ""
docker-compose logs --tail=50 -f app

# ============================================================================
# IMPORTANT NOTES:
# ============================================================================
#
# 1. Environment Variables:
#    - Must be exported to shell BEFORE docker-compose build
#    - Next.js middleware requires them at BUILD TIME
#    - Use: set -a; source .env; set +a
#
# 2. Data Preservation:
#    - NEVER use: docker-compose down -v (deletes volumes!)
#    - Use: docker-compose down (preserves data)
#
# 3. Build Args:
#    - NEXT_PUBLIC_* variables must be in docker-compose.yml build.args
#    - AND in environment section for runtime
#
# 4. Troubleshooting:
#    - Check logs: docker-compose logs -f app
#    - Check env vars: docker-compose exec app env | grep NEXT_PUBLIC
#    - PostgreSQL: docker-compose exec postgres psql -U postgres -d building_survey
#
# 5. Backup:
#    - Always backup before deployment:
#      docker-compose exec postgres pg_dump -U postgres building_survey > backup.sql
#
# ============================================================================
