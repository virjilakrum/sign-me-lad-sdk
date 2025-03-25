/**
 * Utility Functions Tests
 * 
 * This file contains tests for the utility functions in the SignMeLad library.
 * These tests use real implementations without mocks to ensure the functions
 * work as expected in production environments.
 * 
 * @jest-environment jsdom
 */

import { generateMessage, detectWallet, formatPublicKey, formatTimestamp } from '../src/utils';

describe('Utility Functions', () => {
  /**
   * Tests for the message generation function
   */
  describe('generateMessage', () => {
    it('should generate a properly formatted authentication message with the correct structure', () => {
      // Arrange
      const publicKey = '5Zzguz4NsSRNzqP4ynvQfhzktvm5VgQCPkCHWoapJcD9';
      const timestamp = 1617235678901;
      
      // Act
      const message = generateMessage(publicKey, timestamp);
      
      // Assert
      // Check that the message contains all required elements
      expect(message).toContain(publicKey);
      expect(message).toContain('By signing this message');
      expect(message).toContain(`Timestamp: ${timestamp}`);
      expect(message).toContain('does not initiate any transaction');
      
      // Verify the message structure is correct
      const lines = message.split('\n').filter(line => line.trim().length > 0);
      expect(lines.length).toBeGreaterThanOrEqual(3); // At least 3 non-empty lines
      
      // The message should be formatted for clear user understanding
      expect(message.length).toBeGreaterThan(100); // Message should be detailed enough
    });
    
    it('should create unique messages for different public keys and timestamps', () => {
      // Arrange
      const publicKey1 = '5Zzguz4NsSRNzqP4ynvQfhzktvm5VgQCPkCHWoapJcD9';
      const publicKey2 = 'BHEMeAQUYF4SSMabdXLsT16aQXHPQAGQZgKfpMJMKQaR';
      const timestamp1 = 1617235678901;
      const timestamp2 = 1617235678902;
      
      // Act - Generate messages with different inputs
      const message1 = generateMessage(publicKey1, timestamp1);
      const message2 = generateMessage(publicKey2, timestamp1);
      const message3 = generateMessage(publicKey1, timestamp2);
      
      // Assert - All messages should be different
      expect(message1).not.toBe(message2);
      expect(message1).not.toBe(message3);
      expect(message2).not.toBe(message3);
    });
  });

  /**
   * Tests for the wallet detection function
   */
  describe('detectWallet', () => {
    beforeEach(() => {
      // Reset wallet properties before each test for isolation
      // Store original properties
      const originalPhantom = window.phantom;
      const originalSolflare = (window as any).solflare;
      const originalSollet = (window as any).sollet;
      const originalSlope = (window as any).slope;
      
      // Clear all wallet properties
      delete window.phantom;
      delete (window as any).solflare;
      delete (window as any).sollet;
      delete (window as any).slope;
      
      // Return function to restore original state
      return () => {
        // Restore original properties after test
        if (originalPhantom) window.phantom = originalPhantom;
        if (originalSolflare) (window as any).solflare = originalSolflare;
        if (originalSollet) (window as any).sollet = originalSollet;
        if (originalSlope) (window as any).slope = originalSlope;
      };
    });

    it('should detect Phantom wallet when available in the window object', () => {
      // Arrange - Create a Phantom wallet instance
      const phantomWallet = { isPhantom: true };
      window.phantom = { solana: phantomWallet };
      
      // Act - Detect available wallets
      const detected = detectWallet();
      
      // Assert - Should find the Phantom wallet
      expect(detected).toBe(phantomWallet);
    });

    it('should detect Solflare wallet when available and Phantom is not', () => {
      // Arrange - Create a Solflare wallet instance
      const solflareWallet = { isSolflare: true };
      (window as any).solflare = solflareWallet;
      
      // Act - Detect available wallets
      const detected = detectWallet();
      
      // Assert - Should find the Solflare wallet
      expect(detected).toBe(solflareWallet);
    });

    it('should detect Sollet wallet when available and others are not', () => {
      // Arrange - Create a Sollet wallet instance
      const solletWallet = { isSollet: true };
      (window as any).sollet = solletWallet;
      
      // Act - Detect available wallets
      const detected = detectWallet();
      
      // Assert - Should find the Sollet wallet
      expect(detected).toBe(solletWallet);
    });

    it('should detect Slope wallet when available and others are not', () => {
      // Arrange - Create a Slope wallet instance
      const slopeWallet = { isSlope: true };
      (window as any).slope = slopeWallet;
      
      // Act - Detect available wallets
      const detected = detectWallet();
      
      // Assert - Should find the Slope wallet
      expect(detected).toBe(slopeWallet);
    });

    it('should return null when no supported wallet is detected', () => {
      // Arrange - No wallets in window object
      
      // Act - Detect available wallets
      const detected = detectWallet();
      
      // Assert - Should not find any wallet
      expect(detected).toBeNull();
    });
  });
  
  /**
   * Tests for the public key formatting function
   */
  describe('formatPublicKey', () => {
    it('should correctly format a public key with the default parameters', () => {
      // Arrange
      const publicKey = '5Zzguz4NsSRNzqP4ynvQfhzktvm5VgQCPkCHWoapJcD9';
      
      // Act
      const formatted = formatPublicKey(publicKey);
      
      // Assert
      expect(formatted).toBe('5Zzg...JcD9');
    });
    
    it('should format a public key with custom prefix and suffix lengths', () => {
      // Arrange
      const publicKey = '5Zzguz4NsSRNzqP4ynvQfhzktvm5VgQCPkCHWoapJcD9';
      
      // Act
      const formatted = formatPublicKey(publicKey, 6, 8);
      
      // Assert
      expect(formatted).toBe('5Zzguz...WoapJcD9');
    });
    
    it('should return the original key when it is too short to abbreviate', () => {
      // Arrange
      const shortKey = '5Zzguz';
      
      // Act
      const formatted = formatPublicKey(shortKey);
      
      // Assert
      expect(formatted).toBe(shortKey);
    });
    
    it('should handle empty or undefined input gracefully', () => {
      // Arrange & Act & Assert
      expect(formatPublicKey('')).toBe('');
      expect(formatPublicKey(undefined as any)).toBe(undefined);
    });
  });
  
  /**
   * Tests for the timestamp formatting function
   */
  describe('formatTimestamp', () => {
    it('should format a timestamp as a readable date string', () => {
      // Arrange
      const timestamp = 1617235678901; // April 1, 2021
      
      // Act
      const formatted = formatTimestamp(timestamp);
      
      // Assert
      // The exact format may depend on locale, but we can check for date components
      expect(formatted).toContain('202'); // Should contain the year
      expect(formatted.length).toBeGreaterThan(8); // Should be a reasonably long string
    });
  });
});
