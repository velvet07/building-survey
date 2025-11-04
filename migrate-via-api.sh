#!/bin/bash

# Migration via Supabase REST API
# This script uses Supabase REST API instead of direct PostgreSQL connection

set -e

echo "=================================================="
echo "  Data Migration: Supabase API → Local PostgreSQL"
echo "=================================================="
echo ""

SUPABASE_URL="https://etpchhopecknyhnjgnor.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cGNoaG9wZWNrbnlobmpnbm9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE1NDc4MCwiZXhwIjoyMDc0NzMwNzgwfQ.vG0oCcjvGJJUgar0Rrph9Y6A5FvFNAaYqN1I-H1eiOo"
LOCAL_DB="postgresql://postgres:x&P7!r!2K!y6^Z9v@postgres:5432/building_survey"

TABLES=("profiles" "projects" "drawings" "photos")

echo "📥 Fetching data from Supabase..."
echo ""

for table in "${TABLES[@]}"; do
    echo "  📦 Fetching $table..."

    # Fetch from Supabase REST API
    curl -s "${SUPABASE_URL}/rest/v1/${table}?select=*" \
        -H "apikey: ${SERVICE_KEY}" \
        -H "Authorization: Bearer ${SERVICE_KEY}" \
        > "/tmp/${table}.json"

    count=$(cat "/tmp/${table}.json" | grep -o "{" | wc -l)
    echo "     Found: $count rows"
done

echo ""
echo "💾 Importing to local PostgreSQL..."
echo ""

# Convert JSON to SQL INSERT statements
for table in "${TABLES[@]}"; do
    echo "  📝 Importing $table..."

    # Use docker exec to run psql with Python JSON parser
    docker exec -i building-survey-db sh -c "
        cat > /tmp/${table}.json << 'JSONEOF'
$(cat /tmp/${table}.json)
JSONEOF

        python3 << 'PYEOF'
import json
import psycopg2

# Read JSON
with open('/tmp/${table}.json', 'r') as f:
    data = json.load(f)

if not data:
    print('  No data to import for ${table}')
    exit(0)

# Connect to PostgreSQL
conn = psycopg2.connect('${LOCAL_DB}')
cur = conn.cursor()

# Get columns from first row
if len(data) > 0:
    columns = list(data[0].keys())

    # Truncate table
    cur.execute('TRUNCATE TABLE public.${table} CASCADE;')

    # Insert rows
    for row in data:
        values = [row.get(col) for col in columns]
        placeholders = ','.join(['%s'] * len(columns))
        query = f\"INSERT INTO public.${table} ({','.join(columns)}) VALUES ({placeholders}) ON CONFLICT DO NOTHING\"
        try:
            cur.execute(query, values)
        except Exception as e:
            print(f'  Error inserting row: {e}')

    conn.commit()
    print(f'  ✅ Imported {len(data)} rows into ${table}')

conn.close()
PYEOF
    "
done

echo ""
echo "✅ Migration completed!"
echo ""
echo "🔄 Restarting application..."
docker-compose restart app

echo ""
echo "✅ Done! Check your application now."
