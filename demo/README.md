# SignMeLad Demo

This directory contains a complete demo application that demonstrates the functionality of SignMeLad.

## Structure

- `frontend/`: Client-side implementation
- `backend/`: Server-side implementation with Express.js

## Running the Demo

### Prerequisites

- Node.js and npm installed
- A Solana wallet extension (Phantom, Solflare, Sollet, or Slope)

### Quick Start (Recommended)

The easiest way to run the demo is by using the provided script:

```bash
# Make sure the script is executable
chmod +x demo/start-demo.sh

# Run the demo
./demo/start-demo.sh
```

This script will:
1. Build the SDK with the browser bundle
2. Start the backend server
3. Start a web server for the frontend
4. Open your browser to the demo page

### Manual Setup

If you prefer to set things up manually:

1. Install and build the SDK from the root directory:
   ```bash
   # From the root directory
   npm install
   npm run build:all
   ```

2. Start the backend server:
   ```bash
   cd demo/backend
   npm install
   npm start
   ```
   This will start the server at `http://localhost:3000`.

3. Serve the frontend:
   ```bash
   # Option 1: Using VS Code Live Server extension
   # Option 2: Using any HTTP server
   cd demo/frontend
   npx http-server
   ```
   This will typically serve the frontend at `http://localhost:8080`.

4. Open the frontend URL in your browser and follow the on-screen instructions.

## Demo Functionality

The demo demonstrates the following features:

1. **Wallet Connection**: Connect to a Solana wallet
2. **Authentication**: Sign a message to authenticate
3. **Protected Content**: Access protected content with JWT token authentication
4. **Session Management**: Persistence of login state

## Using the SignMeLad SDK

This demo showcases how to use the SignMeLad SDK in both client and server environments:

### Client-Side
- Connecting to wallets with error handling
- Signing messages for authentication
- Managing authentication state

### Server-Side
- Verifying signed messages
- Creating and validating JWT tokens
- Protecting routes with authentication middleware

## API Endpoints

- `GET /`: API root
- `POST /api/auth`: Authentication endpoint
- `POST /api/verify`: Token verification endpoint
- `GET /api/protected`: Protected content (requires authentication)

## Troubleshooting

- **Wallet not detected**: Make sure you have a Solana wallet extension installed in your browser
- **Connection failed**: Try refreshing the page and reconnecting
- **Authentication error**: Check browser console for detailed error information