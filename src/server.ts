/**
 * Server-Side Authentication Module
 * 
 * This module provides server-side utilities for verifying signatures
 * and managing JWT tokens for authentication.
 */

import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

// Import types
import { AuthResult, LogLevel } from './types';

// Import error handling
import {
  SignatureVerificationError,
  AuthTokenError
} from './errors';

// Import logger
import logger from './logger';

/**
 * JWT token payload interface
 */
export interface AuthTokenPayload extends JwtPayload {
  /** User's public key */
  publicKey: string;
  /** Timestamp of token creation */
  timestamp: number;
}

/**
 * Options for JWT token creation
 */
export interface TokenOptions {
  /** Token expiration time (in seconds or string like '24h') */
  expiresIn?: string | number;
  /** Token issuer */
  issuer?: string;
  /** Token audience */
  audience?: string;
  /** Token subject (typically the user ID) */
  subject?: string;
  /** Additional custom claims */
  customClaims?: Record<string, any>;
}

/**
 * Default token options
 */
const DEFAULT_TOKEN_OPTIONS: TokenOptions = {
  expiresIn: '24h'
};

/**
 * Verifies authentication result and creates a JWT token
 * 
 * @param authResult Authentication result from client
 * @param jwtSecret JWT secret key used for signing
 * @param options JWT token options
 * @returns JWT token string
 * @throws {SignatureVerificationError} If signature is invalid
 */
export function createAuthToken(
  authResult: AuthResult, 
  jwtSecret: string,
  options: TokenOptions = DEFAULT_TOKEN_OPTIONS
): string {
  logger.debug('Creating auth token from authentication result');
  
  // Verify signature
  const isValid = verifySignature(
    authResult.signature,
    authResult.message,
    authResult.publicKey
  );

  if (!isValid) {
    logger.error('Signature verification failed when creating auth token');
    throw new SignatureVerificationError();
  }

  // Prepare token payload
  const payload: AuthTokenPayload = {
    publicKey: authResult.publicKey,
    timestamp: authResult.timestamp,
    ...options.customClaims
  };

  // Create JWT token
  logger.debug('Generating JWT token');
  
  // Create sign options for JWT
  const tokenOptions: SignOptions = {};
  
  // Handle expiration time - using type assertion to handle the jsonwebtoken type requirements
  if (options.expiresIn !== undefined) {
    // Use type assertion to solve the type issue
    tokenOptions.expiresIn = options.expiresIn as jwt.SignOptions['expiresIn'];
  } else if (DEFAULT_TOKEN_OPTIONS.expiresIn) {
    // Use type assertion to solve the type issue
    tokenOptions.expiresIn = DEFAULT_TOKEN_OPTIONS.expiresIn as jwt.SignOptions['expiresIn'];
  }
  
  // Add other options that don't have type issues
  if (options.issuer) tokenOptions.issuer = options.issuer;
  if (options.audience) tokenOptions.audience = options.audience;
  if (options.subject) tokenOptions.subject = options.subject;

  const token = jwt.sign(
    payload,
    jwtSecret,
    tokenOptions
  );

  logger.info('Auth token created successfully');
  return token;
}

/**
 * Verifies a JWT token
 * 
 * @param token JWT token to verify
 * @param jwtSecret JWT secret key used for signing
 * @param options JWT verification options
 * @returns Decoded token payload
 * @throws {AuthTokenError} If token is invalid or expired
 */
export function verifyAuthToken(
  token: string, 
  jwtSecret: string,
  options?: jwt.VerifyOptions
): AuthTokenPayload {
  logger.debug('Verifying auth token');
  
  try {
    const decoded = jwt.verify(token, jwtSecret, options) as AuthTokenPayload;
    logger.debug('Token verification successful');
    return decoded;
  } catch (error) {
    logger.error('Token verification failed:', error);
    throw new AuthTokenError(
      (error as Error)?.message || 'Invalid or expired token',
      error as Error
    );
  }
}

/**
 * Verifies a signature against a message and public key
 * 
 * @param signature Base58-encoded signature
 * @param message Original message that was signed
 * @param publicKey Solana public key
 * @returns Boolean indicating if signature is valid
 */
export function verifySignature(signature: string, message: string, publicKey: string): boolean {
  logger.debug('Verifying signature', { publicKey: publicKey.slice(0, 8) + '...' });
  
  try {
    // Convert message to bytes
    const messageBytes = new TextEncoder().encode(message);
    
    // Decode signature from base58
    const signatureBytes = bs58.decode(signature);
    
    // Convert public key to bytes
    const publicKeyObj = new PublicKey(publicKey);
    const publicKeyBytes = publicKeyObj.toBytes();

    // Verify signature
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
    
    logger.debug(`Signature verification ${isValid ? 'successful' : 'failed'}`);
    return isValid;
  } catch (error) {
    logger.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Creates an Express middleware for JWT token verification
 * 
 * @param jwtSecret JWT secret key
 * @param options Options for token verification
 * @returns Express middleware function
 */
export function createAuthMiddleware(jwtSecret: string, options?: jwt.VerifyOptions) {
  return function authMiddleware(req: any, res: any, next: Function) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
    
    if (!token) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }
    
    try {
      const decoded = verifyAuthToken(token, jwtSecret, options);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ error: (error as Error).message || 'Invalid or expired token' });
    }
  };
}
