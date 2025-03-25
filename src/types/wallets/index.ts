/**
 * Solana wallet type definitions
 * 
 * This module contains type definitions for different Solana wallet providers,
 * making it easier to interface with them in a type-safe manner.
 */

/** 
 * Common interface for all Solana wallets
 */
export interface SolanaWalletBase {
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
 * Phantom wallet interface
 */
export interface PhantomWallet extends SolanaWalletBase {
  /** Flag to identify Phantom wallet */
  isPhantom: boolean;
  /** Supported features of the wallet */
  supportedTransactionVersions?: Set<number>;
}

/**
 * Solflare wallet interface
 */
export interface SolflareWallet extends SolanaWalletBase {
  /** Flag to identify Solflare wallet */
  isSolflare: boolean;
}

/**
 * Sollet wallet interface
 */
export interface SolletWallet extends SolanaWalletBase {
  /** Flag to identify Sollet wallet */
  isSollet: boolean;
}

/**
 * Slope wallet interface
 */
export interface SlopeWallet extends SolanaWalletBase {
  /** Flag to identify Slope wallet */
  isSlope: boolean;
}

/**
 * Union type for all supported wallets
 */
export type SolanaSupportedWallet = 
  | PhantomWallet
  | SolflareWallet
  | SolletWallet
  | SlopeWallet;

/**
 * Global window extension for wallet providers
 */
declare global {
  interface Window {
    phantom?: {
      solana?: PhantomWallet;
    };
    solflare?: SolflareWallet;
    sollet?: SolletWallet;
    slope?: SlopeWallet;
  }
}
