/**
 * SignMeLad
 * 
 * A comprehensive TypeScript library for implementing secure 
 * authentication using Solana blockchain wallets in web applications.
 * 
 * @packageDocumentation
 */

// Export version info
export const SDK_VERSION = '0.1.0';
export const SDK_NAME = 'SignMeLad';

// Export core components
export { SolanaAuth } from './auth';
export { verifySignature, createAuthToken, verifyAuthToken, createAuthMiddleware } from './server';
export { generateMessage, detectWallet, formatPublicKey, formatTimestamp } from './utils';

// Export types
export * from './types';

// Export error handling
export * from './errors';

// Export logger
export { default as logger } from './logger';

// Default export for easier usage
import { SolanaAuth } from './auth';
export default SolanaAuth;
