/**
 * Logger System Tests
 * 
 * This file contains tests for the logging system in the SignMeLad library.
 * These tests ensure that the logger works correctly with different log levels
 * and can be configured properly.
 * 
 * @jest-environment node
 */

import logger, { Logger } from '../src/logger';
import { LogLevel } from '../src/types';

describe('Logging System', () => {
  /**
   * Safely store and restore console methods
   */
  let originalConsole: {
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
  };

  beforeEach(() => {
    // Store original console methods
    originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error
    };
    
    // Mock console methods
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });
  
  afterEach(() => {
    // Restore original console methods
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  /**
   * Tests for the Logger class
   */
  describe('Logger Class', () => {
    it('should create a new logger instance with default settings', () => {
      // Act
      const testLogger = new Logger();
      
      // Assert
      expect(testLogger).toBeInstanceOf(Logger);
    });
    
    it('should respect debug setting in constructor', () => {
      // Arrange
      const debugLogger = new Logger(true);
      const nonDebugLogger = new Logger(false);
      
      // Act
      debugLogger.debug('Debug message');
      nonDebugLogger.debug('Debug message');
      
      // Assert - Only debug logger should output debug messages
      expect(console.log).toHaveBeenCalledTimes(1);
    });
    
    it('should use custom logger function when provided', () => {
      // Arrange
      const customLoggerFn = jest.fn();
      const testLogger = new Logger(true, customLoggerFn);
      
      // Act
      testLogger.info('Test message');
      
      // Assert
      expect(customLoggerFn).toHaveBeenCalledWith(
        LogLevel.INFO,
        'Test message'
      );
      expect(console.log).not.toHaveBeenCalled(); // Console should not be used
    });
  });
  
  /**
   * Tests for each log level
   */
  describe('Log Levels', () => {
    it('should log debug messages only when debug is enabled', () => {
      // Arrange
      const debugLogger = new Logger(true);
      const nonDebugLogger = new Logger(false);
      
      // Act
      debugLogger.debug('Debug message');
      nonDebugLogger.debug('Should not appear');
      
      // Assert
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Debug message')
      );
    });
    
    it('should log info messages', () => {
      // Arrange
      const testLogger = new Logger();
      
      // Act
      testLogger.info('Info message');
      
      // Assert
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Info message')
      );
    });
    
    it('should log warning messages', () => {
      // Arrange
      const testLogger = new Logger();
      
      // Act
      testLogger.warn('Warning message');
      
      // Assert
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] Warning message')
      );
    });
    
    it('should log error messages', () => {
      // Arrange
      const testLogger = new Logger();
      
      // Act
      testLogger.error('Error message');
      
      // Assert
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Error message')
      );
    });
    
    it('should include additional arguments in logs', () => {
      // Arrange
      const testLogger = new Logger();
      const additionalData = { userId: 123, action: 'login' };
      
      // Act
      testLogger.info('User action', additionalData);
      
      // Assert
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] User action'),
        additionalData
      );
    });
  });
  
  /**
   * Tests for logger configuration
   */
  describe('Logger Configuration', () => {
    it('should update debug setting with configure method', () => {
      // Arrange
      const testLogger = new Logger(false);
      
      // Initially debug messages should not be logged
      testLogger.debug('Should not appear');
      expect(console.log).not.toHaveBeenCalled();
      
      // Act - Enable debug logging
      testLogger.configure({ debug: true });
      testLogger.debug('Should appear');
      
      // Assert
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Should appear')
      );
    });
    
    it('should update custom logger with configure method', () => {
      // Arrange
      const testLogger = new Logger();
      const customLoggerFn = jest.fn();
      
      // Act - Set custom logger
      testLogger.configure({ customLogger: customLoggerFn });
      testLogger.info('Test message');
      
      // Assert
      expect(customLoggerFn).toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
    });
    
    it('should allow removing a custom logger', () => {
      // Arrange
      const customLoggerFn = jest.fn();
      const testLogger = new Logger(false, customLoggerFn);
      
      // Initially custom logger should be used
      testLogger.info('First message');
      expect(customLoggerFn).toHaveBeenCalledTimes(1);
      expect(console.log).not.toHaveBeenCalled();
      
      // Act - Remove custom logger
      testLogger.configure({ customLogger: null });
      testLogger.info('Second message');
      
      // Assert - Now console should be used
      expect(customLoggerFn).toHaveBeenCalledTimes(1); // Still just once
      expect(console.log).toHaveBeenCalledTimes(1);
    });
  });
  
  /**
   * Tests for the default logger instance
   */
  describe('Default Logger Instance', () => {
    it('should provide a singleton default logger', () => {
      // Assert
      expect(logger).toBeInstanceOf(Logger);
    });
    
    it('should allow configuration of the default logger', () => {
      // Arrange
      const customLoggerFn = jest.fn();
      
      // Act
      logger.configure({ 
        debug: true,
        customLogger: customLoggerFn 
      });
      logger.debug('Test message');
      
      // Assert
      expect(customLoggerFn).toHaveBeenCalled();
    });
  });
  
  /**
   * Tests for log message formatting
   */
  describe('Log Message Formatting', () => {
    it('should include timestamp in log messages', () => {
      // Arrange
      const testLogger = new Logger();
      
      // Act
      testLogger.info('Test message');
      
      // Assert
      expect(console.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\]/)
      );
    });
    
    it('should include the SignMeLad identifier in log messages', () => {
      // Arrange
      const testLogger = new Logger();
      
      // Act
      testLogger.info('Test message');
      
      // Assert
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[SignMeLad]')
      );
    });
    
    it('should include the log level in uppercase', () => {
      // Arrange
      const testLogger = new Logger();
      
      // Act
      testLogger.info('Info message');
      testLogger.warn('Warning message');
      testLogger.error('Error message');
      
      // Assert
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]')
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]')
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]')
      );
    });
  });
});
