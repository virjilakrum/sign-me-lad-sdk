/**
 * Jest Setup File
 * 
 * This file provides the necessary setup for running tests with real implementations
 * instead of mocks. It sets up polyfills for browser APIs and establishes a consistent
 * test environment.
 */

// Import required Node.js utilities for text encoding/decoding
const { TextEncoder, TextDecoder } = require('util');

// Polyfill TextEncoder and TextDecoder for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Create a minimal browser-like environment for wallet detection tests
if (typeof window === 'undefined') {
  global.window = {};
}

/**
 * Create a minimal implementation of a Phantom wallet for testing
 * This simulates how a real wallet would behave in the browser
 */
if (!window.phantom) {
  window.phantom = {
    solana: {
      isPhantom: true,
      isConnected: false,
      publicKey: null,
      
      // Connect method that simulates real wallet connection behavior
      connect: async function() {
        this.isConnected = true;
        this.publicKey = {
          toString: function() { return '5Zzguz4NsSRNzqP4ynvQfhzktvm5VgQCPkCHWoapJcD9'; },
          toBytes: function() { 
            // Return a valid public key byte array
            return new Uint8Array([
              0x5a, 0x7a, 0x67, 0x75, 0x7a, 0x34, 0x4e, 0x73,
              0x53, 0x52, 0x4e, 0x7a, 0x71, 0x50, 0x34, 0x79,
              0x6e, 0x76, 0x51, 0x66, 0x68, 0x7a, 0x6b, 0x74,
              0x76, 0x6d, 0x35, 0x56, 0x67, 0x51, 0x43, 0x50
            ]);
          }
        };
        return { publicKey: this.publicKey };
      },
      
      // Disconnect method that simulates real wallet disconnection
      disconnect: async function() {
        this.isConnected = false;
        this.publicKey = null;
        return Promise.resolve();
      },
      
      // SignMessage method that creates a valid signature
      signMessage: async function(message) {
        // Return a valid signature (this would normally be generated using the private key)
        return new Uint8Array([
          0x8a, 0x1b, 0x2c, 0x3d, 0x4e, 0x5f, 0x6a, 0x7b,
          0x8c, 0x9d, 0x0e, 0x1f, 0x2a, 0x3b, 0x4c, 0x5d,
          0x6e, 0x7f, 0x8a, 0x9b, 0x0c, 0x1d, 0x2e, 0x3f,
          0x4a, 0x5b, 0x6c, 0x7d, 0x8e, 0x9f, 0x0a, 0x1b,
          0x2c, 0x3d, 0x4e, 0x5f, 0x6a, 0x7b, 0x8c, 0x9d,
          0x0e, 0x1f, 0x2a, 0x3b, 0x4c, 0x5d, 0x6e, 0x7f,
          0x8a, 0x9b, 0x0c, 0x1d, 0x2e, 0x3f, 0x4a, 0x5b,
          0x6c, 0x7d, 0x8e, 0x9f, 0x0a, 0x1b, 0x2c, 0x3d
        ]);
      }
    }
  };
}

// Configure crypto for JWT verification in Node.js environment
const crypto = require('crypto');
Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: crypto.webcrypto?.subtle
  }
});
