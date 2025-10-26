#!/bin/bash

# API Key Setup Helper Script for NFTFlow
# This script helps you configure your OpenAI API key

echo "🔑 NFTFlow API Key Setup"
echo ""
echo "This script will help you configure your OpenAI API key."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from template..."
    cp env.template .env
    echo "✅ .env file created"
    echo ""
fi

# Check if API key is already set
if grep -q "VITE_OPENAI_API_KEY=sk-" .env 2>/dev/null; then
    echo "✅ VITE_OPENAI_API_KEY appears to be configured"
    echo ""
    read -p "Do you want to update your API key? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

echo "📋 To get an OpenAI API key:"
echo "   1. Visit: https://platform.openai.com/api-keys"
echo "   2. Sign up or log in"
echo "   3. Click 'Create new secret key'"
echo "   4. Copy the key (it starts with 'sk-')"
echo ""
read -p "📝 Paste your OpenAI API key here: " api_key

# Validate the key format
if [[ ! $api_key == sk-* ]]; then
    echo "⚠️  Warning: API key should start with 'sk-'"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Update the .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|VITE_OPENAI_API_KEY=.*|VITE_OPENAI_API_KEY=$api_key|" .env
else
    # Linux
    sed -i "s|VITE_OPENAI_API_KEY=.*|VITE_OPENAI_API_KEY=$api_key|" .env
fi

echo ""
echo "✅ API key updated successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Restart your development server if it's running"
echo "   2. Refresh your browser"
echo "   3. The AI agents will now work!"
echo ""
echo "Note: The API key is stored in .env file (already in .gitignore)"

