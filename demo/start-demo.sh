#!/bin/bash

# Navigate to the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR/.."

# Build the SDK with bundle
echo "Building SignMeLad SDK..."
npm run build:all

# Start the backend server in the background
echo "Starting backend server..."
cd "$SCRIPT_DIR/backend"
npm start &
BACKEND_PID=$!

# Serve the frontend with http-server
echo "Starting frontend server..."
cd "$SCRIPT_DIR/frontend"

# Check if http-server is installed
if command -v http-server &> /dev/null; then
    HTTP_SERVER_CMD="http-server"
elif command -v npx &> /dev/null; then
    HTTP_SERVER_CMD="npx http-server"
else
    echo "Error: http-server not found. Please install it with 'npm install -g http-server'"
    kill $BACKEND_PID
    exit 1
fi

$HTTP_SERVER_CMD -p 8080 &
FRONTEND_PID=$!

echo ""
echo "Demo is running!"
echo "- Backend: http://localhost:3000"
echo "- Frontend: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to kill both servers on exit
function cleanup {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait
wait 