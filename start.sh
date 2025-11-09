#!/bin/bash

# Quick start script for Library Monitor

set -e

echo "🚀 Starting Library Monitor Setup..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"

# Create .env if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env file..."
    cp backend/.env.example backend/.env
    echo "✅ .env created (please review and update if needed)"
fi

echo "📦 Starting Docker containers..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 5

echo ""
echo "✅ Library Monitor is starting!"
echo ""
echo "🌐 Access points:"
echo "  - Frontend: http://localhost:3000"
echo "  - API: http://localhost:8000/api"
echo "  - Admin: http://localhost:8000/admin"
echo ""
echo "📝 Next steps:"
echo "  1. Visit http://localhost:3000 in your browser"
echo "  2. Check logs with: docker-compose logs -f"
echo "  3. Stop with: docker-compose down"
echo ""
echo "📚 Documentation:"
echo "  - Setup: See SETUP.md"
echo "  - Development: See DEVELOPMENT.md"
echo "  - Summary: See PROJECT_SUMMARY.md"
