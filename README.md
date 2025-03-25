# SignMeLad

[![npm version](https://img.shields.io/npm/v/signmelad.svg)](https://www.npmjs.com/package/signmelad)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)

A comprehensive SDK for implementing secure authentication using Solana blockchain wallets in web applications. SignMeLad provides a secure, standardized approach to wallet-based authentication with robust error handling, extensive logging, and full TypeScript support. All implementations use real functionality without mocks for maximum reliability in production environments.

## Features

- **Wallet Integration**: Seamless connection with popular Solana wallets (Phantom, Solflare, Sollet, Slope)
- **Secure Authentication**: Message signing for cryptographically verifiable authentication
- **Comprehensive Error Handling**: Detailed error classes for specific failure scenarios
- **Advanced Logging System**: Configurable logging with multiple levels
- **JWT Session Management**: Token-based authentication for secure sessions
- **Server-Side Utilities**: Verification functions and Express middleware
- **Multi-Network Support**: Works with mainnet, testnet, devnet, and localnet
- **TypeScript Support**: Complete type definitions with detailed JSDoc
- **Production-Ready Testing**: Thorough testing with real implementations instead of mocks

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [Client-Side Implementation](#client-side-implementation)
  - [Server-Side Implementation](#server-side-implementation)
  - [Error Handling](#error-handling)
  - [Logging](#logging)
- [API Reference](#api-reference)
- [Demo Application](#demo-application)
- [Browser Compatibility](#browser-compatibility)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install signmelad
```

## Quick Start

### Client-Side

```typescript
import { SolanaAuth } from 'signmelad';

// Initialize SDK
const auth = new SolanaAuth({ network: 'mainnet-beta' });

// Connect to wallet
const publicKey = await auth.connect();

// Authenticate
const authResult = await auth.authenticate();

// Send to your backend
const response = await fetch('/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(authResult)
});

const { token } = await response.json();
localStorage.setItem('authToken', token);
```

### Server-Side

```typescript
import express from 'express';
import { createAuthToken, createAuthMiddleware } from 'signmelad';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

// Handle authentication request
app.post('/api/auth', (req, res) => {
  try {
    const token = createAuthToken(req.body, JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Protected route with middleware
app.get('/api/protected', createAuthMiddleware(JWT_SECRET), (req, res) => {
  res.json({ data: 'Protected content', user: req.user });
});
```

## Usage

### Client-Side Implementation

#### Initialization

```typescript
import { SolanaAuth, WalletNotFoundError } from 'signmelad';

// Basic initialization
const auth = new SolanaAuth();

// With configuration options
const authWithOptions = new SolanaAuth({
  network: 'devnet',
  autoConnect: true,
  debug: true,
  logger: (level, message, ...args) => {
    // Custom logging function
    console[level](`[Custom Logger] ${message}`, ...args);
  }
});
```

#### Wallet Connection

```typescript
// Connect to wallet
try {
  const publicKey = await auth.connect();
  console.log(`Connected to wallet: ${publicKey}`);
} catch (error) {
  if (error instanceof WalletNotFoundError) {
    console.error('No Solana wallet extension found. Please install one.');
  } else {
    console.error('Failed to connect to wallet:', error);
  }
}

// Get current connection status
const status = auth.getStatus();
if (status.isConnected) {
  console.log(`Connected to ${status.providerName} wallet: ${status.publicKey}`);
}

// Disconnect
await auth.disconnect();
```

#### Authentication

```typescript
// Standard authentication
try {
  const authResult = await auth.authenticate();
  
  // Send to your backend
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authResult)
  });
  
  const { token } = await response.json();
  localStorage.setItem('authToken', token);
} catch (error) {
  console.error('Authentication failed:', error);
}

// Custom authentication message
const customMessage = 'Sign this message to login to My App';
const authResultCustom = await auth.authenticate(customMessage);
```

### Server-Side Implementation

#### JWT Authentication

```typescript
import { createAuthToken, verifyAuthToken, verifySignature } from 'signmelad';

// Create authentication token
try {
  const token = createAuthToken(authResult, JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'my-app',
    audience: 'my-api'
  });
  
  // Store or return token
} catch (error) {
  console.error('Failed to create auth token:', error);
}

// Verify authentication token
try {
  const decoded = verifyAuthToken(token, JWT_SECRET);
  const { publicKey, timestamp } = decoded;
  
  // Use decoded information
} catch (error) {
  console.error('Invalid token:', error);
}

// Manual signature verification
const isValid = verifySignature(signature, message, publicKey);
```

#### Express Middleware

```typescript
import express from 'express';
import { createAuthMiddleware } from 'signmelad';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

// Create authentication middleware
const authMiddleware = createAuthMiddleware(JWT_SECRET, {
  audience: 'my-api',
  issuer: 'my-app'
});

// Use middleware for protected routes
app.get('/api/profile', authMiddleware, (req, res) => {
  // req.user contains the decoded token
  res.json({ user: req.user });
});
```

### Error Handling

The SDK provides specific error classes for different types of failures:

```typescript
import {
  SolanaSSORError,
  WalletNotFoundError,
  WalletConnectionError,
  WalletNotConnectedError,
  SigningError,
  AuthTokenError
} from 'signmelad';

try {
  await auth.connect();
} catch (error) {
  if (error instanceof WalletNotFoundError) {
    console.error('No wallet extension found. Please install Phantom, Solflare, or another Solana wallet.');
  } else if (error instanceof WalletConnectionError) {
    console.error('Failed to connect to wallet. The user may have denied the connection request.');
  } else {
    console.error('An unexpected error occurred:', error);
  }
}
```

### Logging

The SDK includes a configurable logging system:

```typescript
import { logger, LogLevel } from 'signmelad';

// Enable debug logging
logger.configure({ debug: true });

// Use custom logger
logger.configure({
  customLogger: (level, message, ...args) => {
    // Send to your logging service
    myLoggingService.log(level, message, args);
  }
});

// Log manually
logger.debug('Detailed information for debugging');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error message', new Error('Something went wrong'));
```

## API Reference

For detailed API documentation, see the [API Reference](https://github.com/username/signmelad/docs).

## Demo Application

This repository includes a complete demo application that demonstrates the SDK functionality:

1. First, build the SDK:
   ```bash
   npm install
   npm run build
   ```

2. Start the backend server:
   ```bash
   cd demo/backend
   npm install
   npm start
   ```

3. Run the frontend using an HTTP server:
   ```bash
   cd demo/frontend
   npx http-server
   ```

4. Navigate to `http://localhost:8080` in your browser

The demo showcases:
- Wallet connection
- Authentication flow
- Token-based session management
- Protected content access

## Browser Compatibility

The SDK is compatible with modern browsers:

| Browser         | Compatibility |
|-----------------|---------------|
| Chrome          | 61+           |
| Firefox         | 60+           |
| Safari          | 11+           |
| Edge (Chromium) | 79+           |
| Opera           | 48+           |

For more detailed compatibility information, see [BROWSER_COMPATIBILITY.md](BROWSER_COMPATIBILITY.md).

## Security Considerations

1. **Real Implementations**: SignMeLad uses real cryptographic implementations rather than simulated ones, ensuring proper security in production.

2. **Message Signing**: Authentication messages include a timestamp and the user's public key to prevent replay attacks.

3. **JWT Security**: Never hardcode JWT secrets in client-side code. Always use environment variables on the server side.

4. **Token Storage**: In production, consider using secure cookie storage with HttpOnly and Secure flags instead of localStorage.

5. **CORS Configuration**: Implement proper CORS settings to prevent unauthorized cross-origin requests.

6. **Network Security**: Always use HTTPS in production environments to encrypt authentication data in transit.

## Supported Wallets

The SDK supports the following Solana wallets:

- [Phantom](https://phantom.app/)
- [Solflare](https://solflare.com/)
- [Sollet](https://www.sollet.io/)
- [Slope](https://slope.finance/)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
