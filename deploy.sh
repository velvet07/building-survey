#!/bin/bash

# Building Survey - Docker Deployment Script
# Ez a script frissíti az alkalmazást a szerveren

set -e  # Kilép hiba esetén

echo "🚀 Building Survey Deployment Started..."

# Színek a kimeneti üzenetekhez
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Lépés 1: Git pull a legfrissebb kód lekérésére
echo -e "\n${BLUE}📥 Step 1: Pulling latest code from repository...${NC}"
git fetch origin
git checkout claude/fix-empty-page-console-error-011CUq4FiRzvDweyYrokGmfb
git pull origin claude/fix-empty-page-console-error-011CUq4FiRzvDweyYrokGmfb

# Lépés 2: Leállítás és törlés
echo -e "\n${BLUE}🛑 Step 2: Stopping existing containers...${NC}"
docker-compose down || true

# Lépés 3: Régi image törlése (opcionális, szabad helyet csinál)
echo -e "\n${BLUE}🗑️  Step 3: Removing old images...${NC}"
docker rmi building-survey-web:latest || true

# Lépés 4: Új build készítése
echo -e "\n${BLUE}🏗️  Step 4: Building new Docker image...${NC}"
docker-compose build --no-cache

# Lépés 5: Konténerek indítása
echo -e "\n${BLUE}▶️  Step 5: Starting containers...${NC}"
docker-compose up -d

# Lépés 6: Logok megjelenítése
echo -e "\n${BLUE}📋 Step 6: Showing container logs...${NC}"
sleep 3
docker-compose logs --tail=50

# Státusz ellenőrzése
echo -e "\n${BLUE}✅ Step 7: Checking container status...${NC}"
docker-compose ps

echo -e "\n${GREEN}✨ Deployment Complete!${NC}"
echo -e "${GREEN}The application should be running on http://localhost:3000${NC}"
echo -e "\n${YELLOW}Useful commands:${NC}"
echo -e "  ${BLUE}View logs:${NC}       docker-compose logs -f"
echo -e "  ${BLUE}Stop app:${NC}        docker-compose down"
echo -e "  ${BLUE}Restart app:${NC}     docker-compose restart"
echo -e "  ${BLUE}Container status:${NC} docker-compose ps"
