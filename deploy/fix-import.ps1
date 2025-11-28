# Fix import in lib/projects.ts
# This script fixes the import path from './auth/local' to '@/lib/auth/local'

$PROJECTS_FILE = "lib/projects.ts"

if (-not (Test-Path $PROJECTS_FILE)) {
    Write-Host "❌ Error: $PROJECTS_FILE not found!" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Checking current import..." -ForegroundColor Cyan
$content = Get-Content $PROJECTS_FILE -Raw

if ($content -match "from\s+['\`"]\.\/auth\/local['\`"]") {
    Write-Host "⚠️  Found wrong import: ./auth/local" -ForegroundColor Yellow
    Write-Host "🔧 Fixing import..." -ForegroundColor Cyan
    
    # Fix the import
    $content = $content -replace "from\s+['\`"]\.\/auth\/local['\`"]", "from '@/lib/auth/local'"
    $content | Set-Content $PROJECTS_FILE -NoNewline
    
    Write-Host "✅ Import fixed!" -ForegroundColor Green
    Write-Host "📝 New import:" -ForegroundColor Cyan
    Get-Content $PROJECTS_FILE | Select-String "from.*auth/local"
} elseif ($content -match "from\s+['\`"]@\/lib\/auth\/local['\`"]") {
    Write-Host "✅ Import is already correct: @/lib/auth/local" -ForegroundColor Green
} else {
    Write-Host "❌ Error: Could not find auth/local import in $PROJECTS_FILE" -ForegroundColor Red
    exit 1
}

