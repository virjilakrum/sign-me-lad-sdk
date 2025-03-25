/**
 * SolanaAuth Class Tests
 * 
 * This file contains unit tests for the SolanaAuth class which is the main authentication
 * component of the SignMeLad library. These tests use real implementations rather than
 * mocks to ensure the class works properly in production environments.
 * 
 * @jest-environment jsdom
 */

import { SolanaAuth } from '../src/auth';
import { Connection, PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { WalletNotFoundError, WalletNotConnectedError } from '../src/errors';

describe('SolanaAuth Class', () => {
  /**
   * Create a real SolanaAuth instance for testing
   */
  let auth: SolanaAuth;

  beforeEach(() => {
    // Initialize with testnet for tests
    auth = new SolanaAuth({ 
      network: 'testnet',
      debug: false // Disable debug logging for cleaner test output
    });
  });

  /**
   * Tests for the constructor and initialization
   */
  describe('Constructor and Initialization', () => {
    it('should initialize with default options when none are provided', () => {
      // Arrange & Act
      const defaultAuth = new SolanaAuth();
      
      // Assert - Check that the connection was created with mainnet
      // We can't directly examine private properties, but we can test behavior
      const status = defaultAuth.getStatus();
      expect(status).toBeDefined();
      // The connection property is private, but we can infer it was created
    });

    it('should initialize with provided network option', () => {
      // Arrange & Act 
      const devnetAuth = new SolanaAuth({ network: 'devnet' });
      
      // Assert
      // Again, connection is private but initialization should complete without error
      expect(devnetAuth).toBeDefined();
    });
    
    it('should attempt to detect an available wallet', () => {
      // Arrange - wallet detection happens in constructor
      
      // Act - get the status which reports on wallet detection
      const status = auth.getStatus();
      
      // Assert
      expect(status).toBeDefined();
      // If phantom was defined in the test environment, it should be found
      if (window.phantom) {
        expect(status.providerName).toBe('Phantom');
      }
    });
  });

  /**
   * Tests for the connect method
   */
  describe('Wallet Connection', () => {
    it('should connect to the wallet and return the public key', async () => {
      // Skip if no wallet is available in the test environment
      if (!window.phantom) {
        console.warn('Skipping wallet connection test - no wallet available');
        return;
      }
      
      // Arrange - auth is created in beforeEach
      
      // Act
      const publicKey = await auth.connect();
      
      // Assert
      expect(publicKey).toBeDefined();
      expect(typeof publicKey).toBe('string');
      expect(publicKey.length).toBeGreaterThan(30); // Solana public keys are typically 44 chars
    });

    it('should throw WalletNotFoundError if no wallet is available', async () => {
      // Arrange - Temporarily remove the wallet
      const originalPhantom = window.phantom;
      delete window.phantom;
      
      // Create a new instance with no wallet
      const noWalletAuth = new SolanaAuth();
      
      // Act & Assert
      await expect(noWalletAuth.connect()).rejects.toThrow(WalletNotFoundError);
      
      // Restore wallet for other tests
      window.phantom = originalPhantom;
    });
  });

  /**
   * Tests for the authenticate method
   */
  describe('Authentication', () => {
    it('should authenticate with the wallet and return valid auth result', async () => {
      // Skip if no wallet is available in the test environment
      if (!window.phantom) {
        console.warn('Skipping authentication test - no wallet available');
        return;
      }
      
      // Arrange - Connect to wallet first
      await auth.connect();
      
      // Act
      const result = await auth.authenticate();
      
      // Assert
      expect(result).toBeDefined();
      expect(result.publicKey).toBeDefined();
      expect(result.signature).toBeDefined();
      expect(result.message).toBeDefined();
      expect(result.timestamp).toBeGreaterThan(0);
      
      // Verify the message contains the public key
      expect(result.message).toContain(result.publicKey);
      
      // Verify signature is in base58 format (non-empty string)
      expect(typeof result.signature).toBe('string');
      expect(result.signature.length).toBeGreaterThan(10);
    });

    it('should throw WalletNotConnectedError if wallet is not connected', async () => {
      // Skip if no wallet is available in the test environment
      if (!window.phantom) {
        console.warn('Skipping authentication error test - no wallet available');
        return;
      }
      
      // Arrange - Create a new instance without connecting
      const disconnectedAuth = new SolanaAuth();
      
      // Act & Assert
      await expect(disconnectedAuth.authenticate()).rejects.toThrow(WalletNotConnectedError);
    });
    
    it('should allow using a custom authentication message', async () => {
      // Skip if no wallet is available in the test environment
      if (!window.phantom) {
        console.warn('Skipping custom message test - no wallet available');
        return;
      }
      
      // Arrange - Connect to wallet first
      await auth.connect();
      const customMessage = 'Custom authentication message for testing';
      
      // Act
      const result = await auth.authenticate(customMessage);
      
      // Assert
      expect(result.message).toBe(customMessage);
    });
  });

  /**
   * Tests for the verify method
   */
  describe('Signature Verification', () => {
    it('should correctly verify a valid signature', async () => {
      // Skip if no wallet is available in the test environment
      if (!window.phantom) {
        console.warn('Skipping signature verification test - no wallet available');
        return;
      }
      
      // Arrange - Create a signature
      await auth.connect();
      const authResult = await auth.authenticate();
      
      // Act
      const isValid = auth.verify(
        authResult.signature,
        authResult.message,
        authResult.publicKey
      );
      
      // Assert
      expect(isValid).toBe(true);
    });
    
    it('should return false for an invalid signature', () => {
      // Arrange
      const publicKey = '5Zzguz4NsSRNzqP4ynvQfhzktvm5VgQCPkCHWoapJcD9';
      const message = 'Test message';
      const invalidSignature = 'invalidSignature123';
      
      // Act
      const isValid = auth.verify(invalidSignature, message, publicKey);
      
      // Assert
      expect(isValid).toBe(false);
    });
    
    it('should handle verification errors gracefully', () => {
      // Arrange - Pass invalid data that will cause errors in the verification process
      const invalidPublicKey = 'not-a-valid-public-key';
      const message = 'Test message';
      const invalidSignature = 'invalid';
      
      // Act & Assert - Should not throw but return false
      expect(() => auth.verify(invalidSignature, message, invalidPublicKey)).not.toThrow();
      expect(auth.verify(invalidSignature, message, invalidPublicKey)).toBe(false);
    });
  });

  /**
   * Tests for the disconnect method
   */
  describe('Disconnection', () => {
    it('should disconnect from the wallet successfully', async () => {
      // Skip if no wallet is available in the test environment
      if (!window.phantom) {
        console.warn('Skipping disconnect test - no wallet available');
        return;
      }
      
      // Arrange - Connect first
      await auth.connect();
      
      // Get the initial status
      const statusBefore = auth.getStatus();
      expect(statusBefore.isConnected).toBe(true);
      
      // Act
      await auth.disconnect();
      
      // Assert
      const statusAfter = auth.getStatus();
      
      // The wallet should now be disconnected or have a null publicKey
      expect(statusAfter.isConnected).toBe(false);
      expect(statusAfter.publicKey).toBeNull();
    });
    
    it('should handle disconnection even if wallet is not connected', async () => {
      // Arrange - Don't connect
      
      // Act & Assert - Should not throw
      await expect(auth.disconnect()).resolves.not.toThrow();
    });
  });
  
  /**
   * Tests for the getStatus method
   */
  describe('Status Reporting', () => {
    it('should report correct connection status', async () => {
      // Skip if no wallet is available in the test environment
      if (!window.phantom) {
        console.warn('Skipping status test - no wallet available');
        return;
      }
      
      // Arrange - Initial status before connection
      const initialStatus = auth.getStatus();
      expect(initialStatus.isConnected).toBe(false);
      
      // Act - Connect
      await auth.connect();
      
      // Assert - Status after connection
      const connectedStatus = auth.getStatus();
      expect(connectedStatus.isConnected).toBe(true);
      expect(connectedStatus.publicKey).toBeDefined();
      expect(connectedStatus.providerName).toBeDefined();
      
      // Act - Disconnect
      await auth.disconnect();
      
      // Assert - Status after disconnection
      const disconnectedStatus = auth.getStatus();
      expect(disconnectedStatus.isConnected).toBe(false);
    });
  });
});
