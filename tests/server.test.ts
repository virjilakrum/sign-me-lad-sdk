/**
 * Server-Side Authentication Tests
 * 
 * This file contains tests for the server-side authentication utilities in the SignMeLad library.
 * These tests use real implementations instead of mocks to ensure the functions work as
 * expected in production environments.
 * 
 * @jest-environment node
 */

import { createAuthToken, verifyAuthToken, verifySignature, createAuthMiddleware } from '../src/server';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import jwt from 'jsonwebtoken';
import { AuthTokenError, SignatureVerificationError } from '../src/errors';

describe('Server Authentication Utilities', () => {
  // Constants used across tests
  const JWT_SECRET = 'test-jwt-secret-key-that-is-sufficiently-long-for-testing';
  
  // Generate a real keypair using tweetnacl for testing
  const testKeypair = nacl.sign.keyPair();
  const testPublicKey = bs58.encode(testKeypair.publicKey);
  
  /**
   * Function to create a real signature for testing
   * @param message - Message to sign
   * @returns Base58-encoded signature
   */
  function createRealSignature(message: string): string {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = nacl.sign.detached(messageBytes, testKeypair.secretKey);
    return bs58.encode(signatureBytes);
  }

  /**
   * Tests for the signature verification function
   */
  describe('verifySignature', () => {
    it('should verify a valid signature correctly', () => {
      // Arrange
      const message = 'Test message for verification';
      const signature = createRealSignature(message);
      
      // Act
      const isValid = verifySignature(signature, message, testPublicKey);
      
      // Assert
      expect(isValid).toBe(true);
    });

    it('should reject an invalid signature', () => {
      // Arrange
      const message = 'Test message for verification';
      const differentMessage = 'Different message';
      const signature = createRealSignature(message);
      
      // Act - Verify with the wrong message
      const isValid = verifySignature(signature, differentMessage, testPublicKey);
      
      // Assert
      expect(isValid).toBe(false);
    });

    it('should handle verification errors gracefully', () => {
      // Arrange
      const message = 'Test message';
      const invalidSignature = 'invalid-signature-format';
      const invalidPublicKey = 'invalid-public-key';
      
      // Act & Assert
      expect(() => verifySignature(invalidSignature, message, invalidPublicKey)).not.toThrow();
      expect(verifySignature(invalidSignature, message, invalidPublicKey)).toBe(false);
    });
  });

  /**
   * Tests for the token creation function
   */
  describe('createAuthToken', () => {
    it('should create a valid JWT token from authentication result', () => {
      // Arrange
      const message = 'Authentication message';
      const signature = createRealSignature(message);
      const timestamp = Date.now();
      
      const authResult = {
        publicKey: testPublicKey,
        signature,
        message,
        timestamp
      };

      // Act
      const token = createAuthToken(authResult, JWT_SECRET);
      
      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify the token can be decoded
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      expect(decoded.publicKey).toBe(testPublicKey);
      expect(decoded.timestamp).toBe(timestamp);
    });

    it('should throw an error if signature verification fails', () => {
      // Arrange
      const message = 'Authentication message';
      const invalidSignature = 'invalid-signature';
      const timestamp = Date.now();
      
      const authResult = {
        publicKey: testPublicKey,
        signature: invalidSignature,
        message,
        timestamp
      };

      // Act & Assert
      expect(() => createAuthToken(authResult, JWT_SECRET)).toThrow(SignatureVerificationError);
    });
    
    it('should include custom claims when provided', () => {
      // Arrange
      const message = 'Authentication message';
      const signature = createRealSignature(message);
      const timestamp = Date.now();
      
      const authResult = {
        publicKey: testPublicKey,
        signature,
        message,
        timestamp
      };
      
      const tokenOptions = {
        customClaims: {
          role: 'admin',
          permissions: ['read', 'write']
        }
      };

      // Act
      const token = createAuthToken(authResult, JWT_SECRET, tokenOptions);
      
      // Assert
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      expect(decoded.role).toBe('admin');
      expect(decoded.permissions).toEqual(['read', 'write']);
    });
    
    it('should respect token expiration settings', () => {
      // Arrange
      const message = 'Authentication message';
      const signature = createRealSignature(message);
      const timestamp = Date.now();
      
      const authResult = {
        publicKey: testPublicKey,
        signature,
        message,
        timestamp
      };
      
      // Set a very short expiration
      const tokenOptions = {
        expiresIn: '1s'
      };

      // Act
      const token = createAuthToken(authResult, JWT_SECRET, tokenOptions);
      
      // Assert - Token should be valid initially
      expect(() => jwt.verify(token, JWT_SECRET)).not.toThrow();
      
      // Wait for token to expire
      return new Promise(resolve => {
        setTimeout(() => {
          // Token should now be expired
          expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
          resolve(true);
        }, 1500); // Wait longer than the expiration time
      });
    });
  });

  /**
   * Tests for the token verification function
   */
  describe('verifyAuthToken', () => {
    it('should verify a valid token correctly', () => {
      // Arrange
      const payload = {
        publicKey: testPublicKey,
        timestamp: Date.now()
      };
      
      // Create a real token
      const token = jwt.sign(payload, JWT_SECRET);
      
      // Act
      const decoded = verifyAuthToken(token, JWT_SECRET);
      
      // Assert
      expect(decoded).toBeDefined();
      expect(decoded.publicKey).toBe(testPublicKey);
      expect(decoded.timestamp).toBe(payload.timestamp);
    });

    it('should throw an error for expired tokens', () => {
      // Arrange - Create token that is already expired
      const payload = {
        publicKey: testPublicKey,
        timestamp: Date.now()
      };
      
      const expiredToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1h' });
      
      // Act & Assert
      expect(() => verifyAuthToken(expiredToken, JWT_SECRET)).toThrow(AuthTokenError);
    });
    
    it('should throw an error for invalid tokens', () => {
      // Arrange
      const invalidToken = 'invalid.token.format';
      
      // Act & Assert
      expect(() => verifyAuthToken(invalidToken, JWT_SECRET)).toThrow(AuthTokenError);
    });
    
    it('should throw an error for tokens signed with wrong secret', () => {
      // Arrange
      const payload = {
        publicKey: testPublicKey,
        timestamp: Date.now()
      };
      
      // Create token with different secret
      const token = jwt.sign(payload, 'different-secret');
      
      // Act & Assert
      expect(() => verifyAuthToken(token, JWT_SECRET)).toThrow(AuthTokenError);
    });
  });

  /**
   * Tests for the Express middleware
   */
  describe('createAuthMiddleware', () => {
    it('should create a middleware function', () => {
      // Act
      const middleware = createAuthMiddleware(JWT_SECRET);
      
      // Assert
      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe('function');
    });
    
    it('should pass the request to next middleware when token is valid', () => {
      // Arrange
      const payload = {
        publicKey: testPublicKey,
        timestamp: Date.now()
      };
      
      const token = jwt.sign(payload, JWT_SECRET);
      
      const middleware = createAuthMiddleware(JWT_SECRET);
      
      const req = { 
        headers: { 
          authorization: `Bearer ${token}` 
        } 
      };
      const res = { 
        status: jest.fn().mockReturnThis(),
        json: jest.fn() 
      };
      const next = jest.fn();
      
      // Act
      middleware(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(req).toHaveProperty('user');
      expect(req.user.publicKey).toBe(testPublicKey);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
    
    it('should respond with 401 when authorization header is missing', () => {
      // Arrange
      const middleware = createAuthMiddleware(JWT_SECRET);
      
      const req = { headers: {} };
      const res = { 
        status: jest.fn().mockReturnThis(),
        json: jest.fn() 
      };
      const next = jest.fn();
      
      // Act
      middleware(req, res, next);
      
      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
    
    it('should respond with 403 when token is invalid', () => {
      // Arrange
      const middleware = createAuthMiddleware(JWT_SECRET);
      
      const req = { 
        headers: { 
          authorization: 'Bearer invalid-token' 
        } 
      };
      const res = { 
        status: jest.fn().mockReturnThis(),
        json: jest.fn() 
      };
      const next = jest.fn();
      
      // Act
      middleware(req, res, next);
      
      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
  });
});
