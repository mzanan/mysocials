#!/bin/bash

echo "🐍 Setting up Python environment..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip first."
    exit 1
fi

echo "📦 Installing Python dependencies..."
pip3 install -r scripts/requirements.txt

echo "✅ Setup complete! You can now run 'npm run dev'"

