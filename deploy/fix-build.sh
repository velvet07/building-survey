#!/bin/bash

# Fix build issues by clearing cache and rebuilding

echo "🧹 Clearing build cache..."
rm -rf .next

echo "🔨 Rebuilding..."
npm run build

echo "✅ Done!"

