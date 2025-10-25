#!/bin/bash

# ==============================================================================
# Building Survey - PDF Documentation Generator
# ==============================================================================
# This script generates a PDF from the USER_GUIDE.html file
# ==============================================================================

set -e

echo "📄 Building Survey - PDF Generator"
echo ""

# Check if running from docs directory
if [ ! -f "USER_GUIDE.html" ]; then
    echo "❌ Error: USER_GUIDE.html not found!"
    echo "Please run this script from the docs/ directory:"
    echo "  cd docs/"
    echo "  ./generate-pdf.sh"
    echo ""
    exit 1
fi

# Method 1: Using wkhtmltopdf (best quality, recommended)
if command -v wkhtmltopdf &> /dev/null; then
    echo "✅ Using wkhtmltopdf (high quality)"
    echo ""

    wkhtmltopdf \
        --enable-local-file-access \
        --print-media-type \
        --page-size A4 \
        --margin-top 20mm \
        --margin-bottom 20mm \
        --margin-left 20mm \
        --margin-right 20mm \
        --encoding UTF-8 \
        --title "Building Survey - Felhasználói Kézikönyv" \
        --footer-center "Oldal [page] / [toPage]" \
        --footer-font-size 8 \
        USER_GUIDE.html \
        USER_GUIDE.pdf

    echo ""
    echo "✅ PDF sikeresen létrehozva: USER_GUIDE.pdf"
    echo "   Méret: $(du -h USER_GUIDE.pdf | cut -f1)"
    echo ""
    exit 0
fi

# Method 2: Using Chrome/Chromium headless (good quality)
if command -v google-chrome &> /dev/null || command -v chromium-browser &> /dev/null; then
    echo "✅ Using Chrome/Chromium headless"
    echo ""

    CHROME_CMD=""
    if command -v google-chrome &> /dev/null; then
        CHROME_CMD="google-chrome"
    elif command -v chromium-browser &> /dev/null; then
        CHROME_CMD="chromium-browser"
    fi

    $CHROME_CMD \
        --headless \
        --disable-gpu \
        --print-to-pdf=USER_GUIDE.pdf \
        --print-to-pdf-no-header \
        --no-margins \
        file://$(pwd)/USER_GUIDE.html

    echo ""
    echo "✅ PDF sikeresen létrehozva: USER_GUIDE.pdf"
    echo "   Méret: $(du -h USER_GUIDE.pdf | cut -f1)"
    echo ""
    exit 0
fi

# Method 3: Using Node.js with Puppeteer (if installed)
if command -v node &> /dev/null && [ -d "node_modules/puppeteer" ]; then
    echo "✅ Using Puppeteer (Node.js)"
    echo ""

    node << 'EOF'
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const htmlPath = 'file://' + path.resolve('USER_GUIDE.html');
    await page.goto(htmlPath, { waitUntil: 'networkidle0' });

    await page.pdf({
        path: 'USER_GUIDE.pdf',
        format: 'A4',
        margin: {
            top: '20mm',
            bottom: '20mm',
            left: '20mm',
            right: '20mm'
        },
        printBackground: true
    });

    await browser.close();
    console.log('✅ PDF created successfully');
})();
EOF

    echo ""
    echo "✅ PDF sikeresen létrehozva: USER_GUIDE.pdf"
    echo "   Méret: $(du -h USER_GUIDE.pdf | cut -f1)"
    echo ""
    exit 0
fi

# No PDF generator found
echo "❌ Nem található PDF generátor!"
echo ""
echo "Kérlek telepítsd az alábbi eszközök egyikét:"
echo ""
echo "1. wkhtmltopdf (ajánlott):"
echo "   Ubuntu/Debian:"
echo "     sudo apt-get install wkhtmltopdf"
echo "   MacOS:"
echo "     brew install wkhtmltopdf"
echo ""
echo "2. Google Chrome vagy Chromium:"
echo "   Ubuntu/Debian:"
echo "     sudo apt-get install chromium-browser"
echo "   MacOS:"
echo "     brew install google-chrome"
echo ""
echo "3. Puppeteer (Node.js):"
echo "   npm install puppeteer"
echo ""
echo "Vagy használd a böngészőt manuálisan:"
echo "   1. Nyisd meg: USER_GUIDE.html"
echo "   2. Ctrl+P (Cmd+P)"
echo "   3. Print to PDF"
echo ""
exit 1
