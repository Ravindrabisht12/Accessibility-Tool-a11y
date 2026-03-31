#!/bin/bash

echo "🚀 Accessibility Monitor - Quick Start Script"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Install Playwright browsers
echo "🌐 Installing Playwright Chromium browser..."
npx playwright install chromium

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Playwright browser"
    exit 1
fi

echo "✅ Playwright browser installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your settings."
else
    echo "ℹ️  .env file already exists"
fi

echo ""

# Initialize database
echo "🗄️  Initializing database..."
npm run init-db

if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Add your sites via the web dashboard or config/sites.json"
echo "3. Run 'npm start' to start the application"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "To start now, run: npm start"
