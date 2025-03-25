/**
 * SignMeLad Error Handling System
 * 
 * This module provides custom error classes for specific error scenarios
 * that may occur during the SDK usage. Each error class extends the base
 * Error class with additional properties and categorization to facilitate
 * better error handling and debugging.
 */

/**
 * Base error class for all SDK-related errors
 */
export class SolanaSSORError extends Error {
  /** Error code for categorization */
  public code: string;
  
  /** Original error (if any) that caused this error */
  public originalError?: Error;

  /**
   * Creates a new SolanaSSORError
   * @param message Human-readable error message
   * @param code Error code for categorization
   * @param originalError Original error that caused this error (optional)
   */
  constructor(message: string, code: string, originalError?: Error) {
    super(message);
    
    // Set the prototype explicitly to ensure instanceof works correctly
    Object.setPrototypeOf(this, SolanaSSORError.prototype);
    
    this.name = 'SolanaSSORError';
    this.code = code;
    this.originalError = originalError;
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when no wallet is found or wallet is not supported
 */
export class WalletNotFoundError extends SolanaSSORError {
  constructor(message: string = 'No supported Solana wallet found.', originalError?: Error) {
    super(message, 'WALLET_NOT_FOUND', originalError);
    this.name = 'WalletNotFoundError';
  }
}

/**
 * Error thrown when wallet connection fails
 */
export class WalletConnectionError extends SolanaSSORError {
  constructor(message: string = 'Failed to connect to wallet.', originalError?: Error) {
    super(message, 'WALLET_CONNECTION_FAILED', originalError);
    this.name = 'WalletConnectionError';
  }
}

/**
 * Error thrown when the wallet is not connected before an operation that requires connection
 */
export class WalletNotConnectedError extends SolanaSSORError {
  constructor(message: string = 'Wallet not connected. You must connect to a wallet first.', originalError?: Error) {
    super(message, 'WALLET_NOT_CONNECTED', originalError);
    this.name = 'WalletNotConnectedError';
  }
}

/**
 * Error thrown when message signing fails
 */
export class SigningError extends SolanaSSORError {
  constructor(message: string = 'Failed to sign message with wallet.', originalError?: Error) {
    super(message, 'SIGNING_FAILED', originalError);
    this.name = 'SigningError';
  }
}

/**
 * Error thrown when signature verification fails
 */
export class SignatureVerificationError extends SolanaSSORError {
  constructor(message: string = 'Signature verification failed.', originalError?: Error) {
    super(message, 'SIGNATURE_VERIFICATION_FAILED', originalError);
    this.name = 'SignatureVerificationError';
  }
}

/**
 * Error thrown when authentication token is invalid or expired
 */
export class AuthTokenError extends SolanaSSORError {
  constructor(message: string = 'Invalid or expired authentication token.', originalError?: Error) {
    super(message, 'AUTH_TOKEN_INVALID', originalError);
    this.name = 'AuthTokenError';
  }
}

/**
 * Error thrown when network-related operations fail
 */
export class NetworkError extends SolanaSSORError {
  constructor(message: string = 'Network operation failed.', originalError?: Error) {
    super(message, 'NETWORK_ERROR', originalError);
    this.name = 'NetworkError';
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigurationError extends SolanaSSORError {
  constructor(message: string = 'Invalid configuration.', originalError?: Error) {
    super(message, 'INVALID_CONFIGURATION', originalError);
    this.name = 'ConfigurationError';
  }
}
