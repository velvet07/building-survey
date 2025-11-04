#!/bin/bash

# Migration Script Wrapper
# Migrates data from Supabase cloud database to local PostgreSQL

set -e

echo "=================================================="
echo "  Data Migration: Supabase → Local PostgreSQL"
echo "=================================================="
echo ""

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed"
    echo "   Install it with: apt-get install nodejs"
    exit 1
fi

# Check if pg module is installed
if ! node -e "require('pg')" 2>/dev/null; then
    echo "📦 Installing required dependencies (pg)..."
    npm install pg
    echo ""
fi

# Check for Supabase connection string
if [ -z "$SUPABASE_CONNECTION_STRING" ]; then
    echo "❌ ERROR: SUPABASE_CONNECTION_STRING is not set"
    echo ""
    echo "You need to set the connection string to your Supabase database."
    echo ""
    echo "Get it from: https://app.supabase.com/project/_/settings/database"
    echo ""
    echo "Format:"
    echo "  postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
    echo ""
    echo "Set it with:"
    echo "  export SUPABASE_CONNECTION_STRING=\"postgresql://postgres:...@db....supabase.co:5432/postgres\""
    echo ""
    echo "Or create a .env file with:"
    echo "  SUPABASE_CONNECTION_STRING=postgresql://postgres:...@db....supabase.co:5432/postgres"
    echo ""
    exit 1
fi

# Check for local PostgreSQL connection
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  WARNING: DATABASE_URL is not set, using default"
    export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/building_survey"
    echo "   Using: $DATABASE_URL"
    echo ""
fi

echo "📋 Configuration:"
echo "   Source (Supabase):  ${SUPABASE_CONNECTION_STRING:0:50}..."
echo "   Target (Local):     $DATABASE_URL"
echo ""

# Confirm
read -p "⚠️  This will OVERWRITE data in local database. Continue? (yes/no): " -r
echo ""
if [[ ! $REPLY =~ ^[Yy](es)?$ ]]; then
    echo "❌ Migration cancelled"
    exit 1
fi

# Create backup of local database first
echo "💾 Creating backup of local database..."
BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"

if command -v pg_dump &> /dev/null; then
    pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null || echo "   ⚠️  Could not create backup"
    if [ -f "$BACKUP_FILE" ]; then
        echo "   ✅ Backup saved to: $BACKUP_FILE"
    fi
else
    echo "   ⚠️  pg_dump not found, skipping backup"
fi
echo ""

# Run migration
echo "🚀 Starting migration..."
echo ""
node "$(dirname "$0")/migrate-from-supabase.js"

echo ""
echo "✅ Migration completed!"
echo ""
echo "Next steps:"
echo "  1. Restart your application"
echo "  2. Verify data in local database"
echo "  3. If something went wrong, restore from backup: $BACKUP_FILE"
echo ""
