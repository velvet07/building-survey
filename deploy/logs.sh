#!/bin/bash

# ==============================================================================
# Building Survey - Logs Script
# ==============================================================================
# This script shows logs from all Docker containers
# ==============================================================================

# Default: show last 100 lines and follow
LINES=${1:-100}

echo "📋 Viewing Building Survey logs (last $LINES lines)..."
echo "Press Ctrl+C to exit"
echo ""

# If argument is "app", show only app logs
if [ "$1" = "app" ]; then
    docker-compose logs -f --tail=100 app
# If argument is "db", show only database logs
elif [ "$1" = "db" ]; then
    docker-compose logs -f --tail=100 postgres
# Otherwise show all logs
else
    docker-compose logs -f --tail=$LINES
fi
