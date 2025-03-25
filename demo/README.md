# SignMeLad Demo

This directory contains a complete demo application that demonstrates the functionality of SignMeLad.

## Structure

- `frontend/`: Client-side implementation
- `backend/`: Server-side implementation with Express.js

## Running the Demo

### Prerequisites

- Node.js and npm installed
- A Solana wallet extension (Phantom, Solflare, Sollet, or Slope)

### Steps

1. Install and build the SDK from the root directory:
   ```bash
   # From the root directory
   npm install
   npm run build
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

### Quick Setup

For convenience, you can also use the provided setup script:
```bash
chmod +x demo/setup.sh
./demo/setup.sh
```

## Demo Functionality

The demo demonstrates the following features:

1. **Wallet Connection**: Connect to a Solana wallet
2. **Authentication**: Sign a message to authenticate
3. **Protected Content**: Access protected content with JWT token authentication
4. **Session Management**: Persistence of login state

## API Endpoints

- `GET /`: API root
- `POST /api/auth`: Authentication endpoint
- `POST /api/verify`: Token verification endpoint
- `GET /api/protected`: Protected content (requires authentication)