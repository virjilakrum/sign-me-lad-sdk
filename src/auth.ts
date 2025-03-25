/**
 * Solana Authentication Module
 * 
 * This module provides the core authentication functionality of the SDK.
 * It handles wallet connection, message signing, and signature verification.
 */

import { Connection, PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

// Import types
import { 
  SolanaSSO, 
  AuthResult, 
  SolanaConfigOptions,
  ConnectionStatus,
  SolanaNetwork,
  SolanaSupportedWallet
} from './types';

// Import utils
import { generateMessage, detectWallet } from './utils';

// Import error handling
import {
  WalletNotFoundError,
  WalletConnectionError,
  WalletNotConnectedError,
  SigningError,
  SignatureVerificationError,
  ConfigurationError
} from './errors';

// Import logger
import logger from './logger';

/**
 * Solana authentication class
 * 
 * This class implements the SolanaSSO interface and provides the main functionality
 * for authenticating with Solana wallets.
 */
export class SolanaAuth implements SolanaSSO {
  /** Solana RPC connection */
  private connection: Connection;
  
  /** Detected wallet instance */
  private wallet: SolanaSupportedWallet | null;
  
  /** Configuration options */
  private options: SolanaConfigOptions;
  
  /** Name of the connected wallet provider */
  private walletProviderName: string | undefined;

  /**
   * Constructor for SolanaAuth class
   * @param options Configuration options
   */
  constructor(options: SolanaConfigOptions = {}) {
    // Default options
    const defaultOptions: SolanaConfigOptions = {
      network: 'mainnet-beta',
      autoConnect: false,
      sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
      debug: false
    };

    this.options = { ...defaultOptions, ...options };
    
    // Configure logger
    logger.configure({
      debug: this.options.debug,
      customLogger: this.options.logger
    });

    // Log initialization
    logger.debug('Initializing SolanaAuth with options:', this.options);
    
    try {
      // Create connection to Solana network
      const endpoint = this.getNetworkEndpoint(this.options.network);
      this.connection = new Connection(endpoint, 'confirmed');
      logger.debug(`Connected to Solana ${this.options.network} at ${endpoint}`);
      
      // Detect wallet
      this.wallet = detectWallet();
      if (this.wallet) {
        // Determine wallet provider name
        if ('isPhantom' in this.wallet) {
          this.walletProviderName = 'Phantom';
        } else if ('isSolflare' in this.wallet) {
          this.walletProviderName = 'Solflare';
        } else if ('isSollet' in this.wallet) {
          this.walletProviderName = 'Sollet';
        } else if ('isSlope' in this.wallet) {
          this.walletProviderName = 'Slope';
        }
        logger.info(`Detected ${this.walletProviderName || 'unknown'} wallet`);
      } else {
        logger.warn('No supported Solana wallet detected');
      }
      
      // Auto-connect if enabled
      if (this.options.autoConnect && this.wallet) {
        logger.debug('Auto-connect enabled, attempting to connect to wallet');
        this.connect().catch(err => {
          logger.error('Auto-connect error:', err);
        });
      }
    } catch (error) {
      logger.error('Initialization error:', error);
      throw new ConfigurationError('Failed to initialize SolanaAuth', error as Error);
    }
  }

  /**
   * Returns the endpoint URL for the Solana network
   * @param network Network name
   * @returns Endpoint URL
   */
  private getNetworkEndpoint(network?: SolanaNetwork): string {
    switch (network) {
      case 'mainnet-beta':
        return 'https://api.mainnet-beta.solana.com';
      case 'testnet':
        return 'https://api.testnet.solana.com';
      case 'devnet':
        return 'https://api.devnet.solana.com';
      case 'localnet':
        return 'http://localhost:8899';
      default:
        return 'https://api.mainnet-beta.solana.com';
    }
  }

  /**
   * Connects to the wallet
   * @returns Public key of the connected wallet
   * @throws {WalletNotFoundError} If no wallet is detected
   * @throws {WalletConnectionError} If connection fails
   */
  public async connect(): Promise<string> {
    logger.debug('Attempting to connect to wallet');
    
    if (!this.wallet) {
      logger.error('Connection failed: No supported Solana wallet found');
      throw new WalletNotFoundError();
    }

    try {
      const { publicKey } = await this.wallet.connect();
      const publicKeyStr = publicKey.toString();
      logger.info(`Connected to wallet: ${publicKeyStr.slice(0, 8)}...${publicKeyStr.slice(-8)}`);
      return publicKeyStr;
    } catch (error) {
      logger.error('Wallet connection error:', error);
      throw new WalletConnectionError(
        `Failed to connect to ${this.walletProviderName || 'wallet'}`,
        error as Error
      );
    }
  }

  /**
   * Authenticates with the wallet by signing a message
   * @param customMessage Custom message (optional)
   * @returns Authentication result
   * @throws {WalletNotConnectedError} If wallet is not connected
   * @throws {SigningError} If message signing fails
   */
  public async authenticate(customMessage?: string): Promise<AuthResult> {
    logger.debug('Starting authentication process');
    
    if (!this.wallet || !this.wallet.publicKey) {
      logger.error('Authentication failed: Wallet not connected');
      throw new WalletNotConnectedError();
    }

    const publicKey = this.wallet.publicKey.toString();
    const timestamp = Date.now();
    const message = customMessage || generateMessage(publicKey, timestamp);
    
    logger.debug('Generated authentication message for signing');
    
    // Encode the message for signing
    const encodedMessage = new TextEncoder().encode(message);
    
    try {
      // Sign the message
      logger.debug('Requesting message signature from wallet');
      const signatureBytes = await this.wallet.signMessage(encodedMessage);
      const signature = bs58.encode(signatureBytes);
      
      const authResult: AuthResult = {
        publicKey,
        signature,
        message,
        timestamp
      };
      
      logger.info('Authentication successful');
      logger.debug('Authentication result:', authResult);
      
      return authResult;
    } catch (error) {
      logger.error('Message signing error:', error);
      throw new SigningError(
        `Failed to sign message with ${this.walletProviderName || 'wallet'}`, 
        error as Error
      );
    }
  }

  /**
   * Verifies a signature against a message and public key
   * @param signature Signature to verify
   * @param message Message that was signed
   * @param publicKey Wallet public key
   * @returns Boolean indicating if signature is valid
   */
  public verify(signature: string, message: string, publicKey: string): boolean {
    logger.debug('Verifying signature', { publicKey: `${publicKey.slice(0, 8)}...` });
    
    try {
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = bs58.decode(signature);
      const publicKeyObj = new PublicKey(publicKey);
      const publicKeyBytes = publicKeyObj.toBytes();

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
   * Disconnects from the wallet
   * @returns Promise that resolves when disconnection is complete
   */
  public async disconnect(): Promise<void> {
    logger.debug('Disconnecting from wallet');
    
    if (this.wallet && typeof this.wallet.disconnect === 'function') {
      try {
        await this.wallet.disconnect();
        logger.info('Disconnected from wallet');
      } catch (error) {
        logger.error('Error disconnecting from wallet:', error);
        throw error;
      }
    } else {
      logger.debug('No wallet to disconnect or wallet does not support disconnect');
    }
  }

  /**
   * Gets the current connection status
   * @returns Connection status object
   */
  public getStatus(): ConnectionStatus {
    const isConnected = !!(this.wallet && this.wallet.publicKey);
    const publicKey = isConnected ? this.wallet!.publicKey!.toString() : null;
    
    return {
      isConnected,
      publicKey,
      providerName: this.walletProviderName
    };
  }
}
