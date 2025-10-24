#!/bin/bash

echo "=========================================="
echo "Bug Detector - Installation Script"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo "   Creating from .env.example..."
    cp .env.example .env
    echo "   ✓ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your GROQ_API_KEY"
    echo "   Get your key from: https://console.groq.com/keys"
    echo ""
else
    echo "✓ .env file exists"
fi

# Install Python dependencies
echo ""
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Test setup
echo ""
echo "🧪 Testing setup..."
python3 test_setup.py

echo ""
echo "=========================================="
echo "Installation complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Edit .env and add your GROQ_API_KEY"
echo "  2. Test OCR: python3 test_groq_ocr.py"
echo "  3. Extract patterns: python3 cli.py extract"
echo "  4. Fix bugs: python3 cli.py fix --help"
echo ""
