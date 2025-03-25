/**
 * Error Handling System Tests
 * 
 * This file contains tests for the custom error classes in the SignMeLad library.
 * These tests ensure that the error handling system works correctly and provides
 * useful information for debugging and error recovery.
 * 
 * @jest-environment node
 */

import {
  SolanaSSORError,
  WalletNotFoundError,
  WalletConnectionError,
  WalletNotConnectedError,
  SigningError,
  SignatureVerificationError,
  AuthTokenError,
  NetworkError,
  ConfigurationError
} from '../src/errors';

describe('Error Handling System', () => {
  /**
   * Tests for the base error class
   */
  describe('SolanaSSORError (Base Error)', () => {
    it('should create an error with the correct properties', () => {
      // Arrange
      const message = 'Test error message';
      const code = 'TEST_ERROR';
      
      // Act
      const error = new SolanaSSORError(message, code);
      
      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(SolanaSSORError);
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.name).toBe('SolanaSSORError');
    });
    
    it('should include the original error when provided', () => {
      // Arrange
      const originalError = new Error('Original error');
      
      // Act
      const error = new SolanaSSORError('Wrapper error', 'WRAPPED', originalError);
      
      // Assert
      expect(error.originalError).toBe(originalError);
    });
    
    it('should capture stack trace', () => {
      // Arrange & Act
      const error = new SolanaSSORError('Test error', 'TEST_ERROR');
      
      // Assert
      expect(error.stack).toBeDefined();
      expect(error.stack?.includes('SolanaSSORError')).toBe(true);
    });
  });
  
  /**
   * Tests for the specialized error classes
   */
  describe('Specialized Error Classes', () => {
    it('should create a WalletNotFoundError with correct properties', () => {
      // Act
      const error = new WalletNotFoundError();
      
      // Assert
      expect(error).toBeInstanceOf(SolanaSSORError);
      expect(error).toBeInstanceOf(WalletNotFoundError);
      expect(error.code).toBe('WALLET_NOT_FOUND');
      expect(error.name).toBe('WalletNotFoundError');
      expect(error.message).toContain('No supported Solana wallet found');
    });
    
    it('should create a WalletConnectionError with correct properties', () => {
      // Act
      const error = new WalletConnectionError();
      
      // Assert
      expect(error).toBeInstanceOf(SolanaSSORError);
      expect(error).toBeInstanceOf(WalletConnectionError);
      expect(error.code).toBe('WALLET_CONNECTION_FAILED');
      expect(error.name).toBe('WalletConnectionError');
    });
    
    it('should create a WalletNotConnectedError with correct properties', () => {
      // Act
      const error = new WalletNotConnectedError();
      
      // Assert
      expect(error).toBeInstanceOf(SolanaSSORError);
      expect(error).toBeInstanceOf(WalletNotConnectedError);
      expect(error.code).toBe('WALLET_NOT_CONNECTED');
      expect(error.name).toBe('WalletNotConnectedError');
    });
    
    it('should create a SigningError with correct properties', () => {
      // Act
      const error = new SigningError();
      
      // Assert
      expect(error).toBeInstanceOf(SolanaSSORError);
      expect(error).toBeInstanceOf(SigningError);
      expect(error.code).toBe('SIGNING_FAILED');
      expect(error.name).toBe('SigningError');
    });
    
    it('should create a SignatureVerificationError with correct properties', () => {
      // Act
      const error = new SignatureVerificationError();
      
      // Assert
      expect(error).toBeInstanceOf(SolanaSSORError);
      expect(error).toBeInstanceOf(SignatureVerificationError);
      expect(error.code).toBe('SIGNATURE_VERIFICATION_FAILED');
      expect(error.name).toBe('SignatureVerificationError');
    });
    
    it('should create an AuthTokenError with correct properties', () => {
      // Act
      const error = new AuthTokenError();
      
      // Assert
      expect(error).toBeInstanceOf(SolanaSSORError);
      expect(error).toBeInstanceOf(AuthTokenError);
      expect(error.code).toBe('AUTH_TOKEN_INVALID');
      expect(error.name).toBe('AuthTokenError');
    });
    
    it('should create a NetworkError with correct properties', () => {
      // Act
      const error = new NetworkError();
      
      // Assert
      expect(error).toBeInstanceOf(SolanaSSORError);
      expect(error).toBeInstanceOf(NetworkError);
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.name).toBe('NetworkError');
    });
    
    it('should create a ConfigurationError with correct properties', () => {
      // Act
      const error = new ConfigurationError();
      
      // Assert
      expect(error).toBeInstanceOf(SolanaSSORError);
      expect(error).toBeInstanceOf(ConfigurationError);
      expect(error.code).toBe('INVALID_CONFIGURATION');
      expect(error.name).toBe('ConfigurationError');
    });
  });
  
  /**
   * Tests for custom error messages and original error chaining
   */
  describe('Custom Error Messages and Error Chaining', () => {
    it('should allow custom error messages', () => {
      // Arrange
      const customMessage = 'Custom wallet not found message';
      
      // Act
      const error = new WalletNotFoundError(customMessage);
      
      // Assert
      expect(error.message).toBe(customMessage);
    });
    
    it('should chain errors correctly', () => {
      // Arrange
      const originalError = new Error('Network request failed');
      const customMessage = 'Failed to connect to the wallet due to network issues';
      
      // Act
      const error = new WalletConnectionError(customMessage, originalError);
      
      // Assert
      expect(error.message).toBe(customMessage);
      expect(error.originalError).toBe(originalError);
    });
    
    it('should allow error handling with try/catch', () => {
      // Arrange
      const throwingFunction = () => {
        throw new WalletNotFoundError('No wallet found in this browser');
      };
      
      // Act & Assert
      try {
        throwingFunction();
        fail('Function should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(WalletNotFoundError);
        expect(error).toBeInstanceOf(SolanaSSORError);
      }
    });
    
    it('should work with async/await error handling', async () => {
      // Arrange
      const asyncThrowingFunction = async () => {
        throw new AuthTokenError('Token expired');
      };
      
      // Act & Assert
      await expect(asyncThrowingFunction()).rejects.toThrow(AuthTokenError);
      await expect(asyncThrowingFunction()).rejects.toBeInstanceOf(SolanaSSORError);
    });
  });
});
