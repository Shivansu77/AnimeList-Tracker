#!/bin/bash

echo "🚀 Starting AnimeList Development Servers..."

# Kill existing processes
pkill -f "node server.js" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true

# Start backend server
echo "📡 Starting backend server..."
cd backend && npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend server
echo "🌐 Starting frontend server..."
cd ../frontend && npm start &
FRONTEND_PID=$!

echo "✅ Servers started!"
echo "📡 Backend: http://localhost:3003"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "🔗 Test shared watchlist: http://localhost:3000/watchlist/test-token"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait