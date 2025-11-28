#!/bin/bash

# Check Node.js version used by different commands

echo "🔍 Node.js verzió ellenőrzés..."
echo ""

echo "1. System Node.js:"
which node
node -v
echo ""

echo "2. npm Node.js:"
npm -v
echo ""

echo "3. Node.js PATH:"
echo $PATH | tr ':' '\n' | grep -i node
echo ""

echo "4. All Node.js installations:"
find /usr/local -name node 2>/dev/null | head -5
find /opt -name node 2>/dev/null | head -5
find /usr -name node 2>/dev/null | head -5
echo ""

echo "5. Node.js which command:"
which -a node 2>/dev/null
echo ""

echo "6. Test build with explicit Node.js:"
# This will show which Node.js is used during build
NODE_VERSION=$(node -v)
echo "Build will use: $NODE_VERSION"

