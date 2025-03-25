#!/bin/bash

# Navigate to the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR/.."

# Install and build the SDK
echo "Installing SignMeLad SDK..."
npm install
npm run build

# Install backend dependencies
echo "Installing backend dependencies..."
cd demo/backend
npm install

# Display completion message
echo ""
echo "Setup completed successfully!"
echo ""
echo "To run the demo application:"
echo "1. Start the backend: cd demo/backend && npm start"
echo "2. Run the frontend with an HTTP server (e.g., VS Code Live Server extension)"
echo ""
echo "Note: You need a Solana wallet (Phantom, Solflare, or Sollet is recommended) to use the application"
