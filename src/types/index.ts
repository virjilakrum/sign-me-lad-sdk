/**
 * Core type definitions for the SignMeLad SDK
 * 
 * This module contains the primary interfaces and types used throughout the SDK,
 * providing a consistent type system for the entire library.
 */

// Re-export wallet types
export * from './wallets';

/**
 * Core interface for the Solana SSO functionality
 * 
 * This interface defines the public API of the SDK.
 */
export interface SolanaSSO {
  /**
   * Connects to a Solana wallet
   * @returns Promise resolving to wallet public key as string
   * @throws {WalletNotFoundError} If no supported wallet is found
   * @throws {WalletConnectionError} If connection to wallet fails
   */
  connect(): Promise<string>;
  
  /**
   * Performs authentication using the wallet by signing a message
   * @param message Custom authentication message (optional)
   * @returns Promise resolving to authentication result
   * @throws {WalletNotConnectedError} If wallet is not connected
   * @throws {SigningError} If message signing fails
   */
  authenticate(message?: string): Promise<AuthResult>;
  
  /**
   * Verifies a signature against a message and public key
   * @param signature Signature to verify
   * @param message Message that was signed
   * @param publicKey Wallet public key
   * @returns Boolean indicating if signature is valid
   */
  verify(signature: string, message: string, publicKey: string): boolean;
  
  /**
   * Disconnects from the wallet
   * @returns Promise that resolves when disconnection is complete
   */
  disconnect(): Promise<void>;
  
  /**
   * Gets the current connection status and public key if connected
   * @returns Connection status object
   */
  getStatus(): ConnectionStatus;
}

/**
 * Authentication result interface
 */
export interface AuthResult {
  /** Wallet public key as string */
  publicKey: string;
  /** Base58-encoded signature */
  signature: string;
  /** Message that was signed */
  message: string;
  /** Unix timestamp of the authentication (milliseconds) */
  timestamp: number;
  /** Optional JWT token if authentication was processed by server */
  token?: string;
}

/**
 * Connection status interface
 */
export interface ConnectionStatus {
  /** Whether the wallet is connected */
  isConnected: boolean;
  /** Wallet public key if connected, null otherwise */
  publicKey: string | null;
  /** Wallet provider name if detected (e.g., "Phantom", "Solflare") */
  providerName?: string;
}

/**
 * Solana network types
 */
export type SolanaNetwork = 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';

/**
 * Configuration options for the Solana SSO SDK
 */
export interface SolanaConfigOptions {
  /** 
   * Solana network to connect to 
   * @default 'mainnet-beta'
   */
  network?: SolanaNetwork;
  
  /** 
   * Whether to automatically connect to the wallet on initialization
   * @default false 
   */
  autoConnect?: boolean;
  
  /** 
   * Session duration in milliseconds
   * @default 24 hours (86400000 ms)
   */
  sessionDuration?: number;
  
  /**
   * Whether to enable debug logging
   * @default false
   */
  debug?: boolean;
  
  /**
   * Custom logger function
   * @default console.log/error
   */
  logger?: LoggerFunction | null;
}

/**
 * Solana supported wallet interface
 */
export interface SolanaSupportedWallet {
  /** Wallet's public key */
  publicKey: { toString(): string } | null;
  /** Whether the wallet is connected */
  isConnected: boolean;
  /** Method to connect to the wallet */
  connect(): Promise<{ publicKey: { toString(): string } }>;
  /** Method to disconnect from the wallet */
  disconnect(): Promise<void>;
  /** Method to sign a message */
  signMessage(message: Uint8Array, encoding?: string): Promise<Uint8Array>;
  /** Method to sign a transaction */
  signTransaction?(transaction: any): Promise<any>;
  /** Method to sign multiple transactions */
  signAllTransactions?(transactions: any[]): Promise<any[]>;
}

/**
 * Logger function type
 */
export type LoggerFunction = (level: LogLevel, message: string, ...args: any[]) => void;

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}
