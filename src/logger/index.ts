/**
 * Logger Module
 * 
 * Provides logging functionality with different log levels and formatting options.
 * This allows for consistent logging throughout the SDK and gives users the ability
 * to customize logging behavior.
 */

import { LogLevel, LoggerFunction } from '../types';

/**
 * Default logger class
 */
export class Logger {
  private debugEnabled: boolean;
  private customLogger: LoggerFunction | null;

  /**
   * Creates a new Logger instance
   * @param debug Whether to enable debug logging
   * @param customLogger Optional custom logger function
   */
  constructor(debug = false, customLogger: LoggerFunction | null = null) {
    this.debugEnabled = debug;
    this.customLogger = customLogger;
  }

  /**
   * Logs a debug message
   * @param message Log message
   * @param args Additional arguments
   */
  public debug(message: string, ...args: any[]): void {
    if (!this.debugEnabled) return;
    this.log(LogLevel.DEBUG, message, ...args);
  }

  /**
   * Logs an info message
   * @param message Log message
   * @param args Additional arguments
   */
  public info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  /**
   * Logs a warning message
   * @param message Log message
   * @param args Additional arguments
   */
  public warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  /**
   * Logs an error message
   * @param message Log message
   * @param args Additional arguments
   */
  public error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  /**
   * Main logging method
   * @param level Log level
   * @param message Log message
   * @param args Additional arguments
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [SignMeLad] [${level.toUpperCase()}] ${message}`;

    // Use custom logger if provided
    if (this.customLogger) {
      this.customLogger(level, message, ...args);
      return;
    }

    // Default logger based on log level
    switch (level) {
      case LogLevel.DEBUG:
        console.log(formattedMessage, ...args);
        break;
      case LogLevel.INFO:
        console.log(formattedMessage, ...args);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, ...args);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, ...args);
        break;
    }
  }

  /**
   * Updates logger configuration
   * @param options Logger configuration options
   */
  public configure({ debug, customLogger }: { debug?: boolean; customLogger?: LoggerFunction | null }): void {
    if (debug !== undefined) {
      this.debugEnabled = debug;
    }
    if (customLogger !== undefined) {
      this.customLogger = customLogger;
    }
  }
}

// Create default logger instance
const defaultLogger = new Logger();

export default defaultLogger;
