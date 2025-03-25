/**
 * Utility Functions Module
 * 
 * This module provides various utility functions used throughout the SDK.
 */

import logger from './logger';
import { SolanaSupportedWallet } from './types';

/**
 * Generates a message for authentication signature
 * 
 * Creates a standardized message for users to sign with their wallet.
 * The message includes the public key and timestamp for security.
 * 
 * @param publicKey Wallet public key
 * @param timestamp Timestamp (milliseconds since epoch)
 * @returns Formatted message string
 */
export function generateMessage(publicKey: string, timestamp: number): string {
  return `By signing this message, you are authenticating with your wallet address ${publicKey}.

This action does not initiate any transaction or transfer any funds from your wallet.

Timestamp: ${timestamp}`;
}

/**
 * Detects available Solana wallet in the browser environment
 * 
 * Checks for supported wallet providers in the window object and returns the first one found.
 * Supports Phantom, Solflare, Sollet, and Slope wallets.
 * 
 * @returns Detected wallet object or null if none found
 */
export function detectWallet(): SolanaSupportedWallet | null {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    logger.debug('Not in browser environment, cannot detect wallet');
    return null;
  }
  
  logger.debug('Detecting available Solana wallets');
  
  // Phantom Wallet
  if (window.phantom?.solana) {
    logger.debug('Phantom wallet detected');
    return window.phantom.solana;
  }
  
  // Solflare Wallet
  if (window.solflare) {
    logger.debug('Solflare wallet detected');
    return window.solflare;
  }
  
  // Sollet Wallet
  if (window.sollet) {
    logger.debug('Sollet wallet detected');
    return window.sollet;
  }
  
  // Slope Wallet
  if (window.slope) {
    logger.debug('Slope wallet detected');
    return window.slope;
  }
  
  logger.debug('No supported wallet detected');
  return null;
}

/**
 * Formats a public key for display by abbreviating it
 * 
 * @param publicKey Full public key string
 * @param prefixLength Number of characters to show at the beginning
 * @param suffixLength Number of characters to show at the end
 * @returns Abbreviated public key
 */
export function formatPublicKey(
  publicKey: string, 
  prefixLength: number = 4, 
  suffixLength: number = 4
): string {
  if (!publicKey || publicKey.length <= prefixLength + suffixLength + 3) {
    return publicKey;
  }
  
  return `${publicKey.slice(0, prefixLength)}...${publicKey.slice(-suffixLength)}`;
}

/**
 * Converts a timestamp to a human-readable date string
 * 
 * @param timestamp Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Checks if an object has a specific property
 * Type-safe property checker
 * 
 * @param obj Object to check
 * @param prop Property name
 * @returns Boolean indicating if property exists
 */
export function hasProperty<T extends object>(
  obj: T,
  prop: string | number | symbol
): prop is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
