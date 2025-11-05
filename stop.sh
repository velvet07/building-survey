#!/bin/bash

# ==============================================================================
# Building Survey - Stop Script
# ==============================================================================
# This script stops all Docker containers
# ==============================================================================

set -e

echo "🛑 Stopping Building Survey..."
echo ""

docker-compose down

echo ""
echo "✅ All containers stopped!"
echo ""
echo "To start again: ./start.sh"
echo "To remove all data (including database): docker-compose down -v"
echo ""
