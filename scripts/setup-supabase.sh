#!/bin/bash

# Supabase Setup Script for Building Survey MVP
# This script helps you set up Supabase step by step

set -e

echo "🚀 Building Survey - Supabase Setup"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}This script will guide you through setting up Supabase.${NC}"
echo ""
echo "Prerequisites:"
echo "1. A Supabase account (https://supabase.com)"
echo "2. A new Supabase project created"
echo ""

read -p "Press Enter to continue..."

# Step 1: Collect Supabase credentials
echo ""
echo -e "${GREEN}Step 1: Supabase Credentials${NC}"
echo "You can find these in your Supabase project dashboard:"
echo "Settings → API"
echo ""

read -p "Enter your Supabase Project URL: " SUPABASE_URL
read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY

# Step 2: Create .env.local
echo ""
echo -e "${GREEN}Step 2: Creating .env.local${NC}"

cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo -e "${GREEN}✓${NC} .env.local created successfully"

# Step 3: Database setup instructions
echo ""
echo -e "${GREEN}Step 3: Database Setup${NC}"
echo ""
echo "Now you need to run the SQL scripts in your Supabase dashboard:"
echo "Go to: Supabase Dashboard → SQL Editor"
echo ""
echo "Run these files in order:"
echo -e "${YELLOW}1. supabase/schema.sql${NC}    - Creates tables and types"
echo -e "${YELLOW}2. supabase/functions.sql${NC} - Creates functions and triggers"
echo -e "${YELLOW}3. supabase/policies.sql${NC}  - Sets up Row Level Security"
echo -e "${YELLOW}4. supabase/seed.sql${NC}      - (Optional) Adds test data"
echo ""
echo "For each file:"
echo "  - Copy the entire content"
echo "  - Paste into SQL Editor"
echo "  - Click 'Run'"
echo ""

read -p "Press Enter when you've completed the database setup..."

# Step 4: Auth configuration
echo ""
echo -e "${GREEN}Step 4: Authentication Configuration${NC}"
echo ""
echo "Go to: Supabase Dashboard → Authentication → Providers"
echo ""
echo "Configure Email Provider:"
echo "  ☑ Enable Email provider"
echo "  ☑ Enable Confirm email"
echo ""
echo "Configure URL Configuration:"
echo "  Site URL: http://localhost:3000"
echo "  Redirect URLs:"
echo "    - http://localhost:3000/auth/callback"
echo "    - http://localhost:3000/**"
echo ""

read -p "Press Enter when auth is configured..."

# Step 5: Install dependencies
echo ""
echo -e "${GREEN}Step 5: Installing Dependencies${NC}"
npm install

# Step 6: Test connection
echo ""
echo -e "${GREEN}Step 6: Testing Setup${NC}"
echo "Starting development server..."
echo ""

npm run dev &
DEV_PID=$!

echo ""
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Click 'Regisztráció' to create a test account"
echo "3. Check your email (or Supabase Dashboard → Auth → Users)"
echo "4. Confirm your email"
echo "5. Login and test project creation"
echo ""
echo "To stop the dev server, press Ctrl+C"
echo ""
echo "For deployment to Netlify, see: docs/NETLIFY_DEPLOYMENT.md"