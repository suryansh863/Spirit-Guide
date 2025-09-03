#!/bin/bash

echo "🍷 Starting Spirit Guide - Indian Market Pricing System"
echo "========================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Start the Indian Market Pricing System
echo ""
echo "🚀 Starting Indian Market Pricing System..."
echo "==========================================="

cd server

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit server/.env and configure your database settings before starting the server."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📥 Installing Node.js dependencies..."
    npm install
fi

# Start the server
echo "🌐 Starting Node.js server on http://localhost:3001"
echo "📊 API Documentation: http://localhost:3001/api"
echo "🏥 Health Check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop the server"

# Start the server
npm run dev
