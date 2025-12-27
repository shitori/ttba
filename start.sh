#!/bin/bash
# Quick start script for TTBA project

echo "🎮 TTBA Project - Quick Start"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 16+ from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo ""

# Install dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo ""
echo "🚀 Starting services..."
echo ""
echo "📝 Remember:"
echo "  1. Backend will run on: http://localhost:3001"
echo "  2. Frontend will run on: http://localhost:3000"
echo "  3. Both windows must stay open"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start backend in background
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Give backend time to start
sleep 2

# Start frontend
echo "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for both processes
wait

