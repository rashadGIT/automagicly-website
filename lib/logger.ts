/**
 * Structured logging utility for AutoMagicly
 *
 * Provides consistent logging across the application with:
 * - Structured JSON format for production
 * - Pretty printing for development
 * - Log levels (info, warn, error)
 * - Context and metadata support
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  if (isDevelopment) {
    // Pretty print for development
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🐛'
    }[entry.level];

    let output = `${emoji} [${entry.level.toUpperCase()}] ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        output += `\n  Stack: ${entry.error.stack}`;
      }
    }

    return output;
  } else {
    // JSON for production (CloudWatch, Datadog, etc.)
    return JSON.stringify(entry);
  }
}

/**
 * Core logging function
 */
function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  const formatted = formatLogEntry(entry);

  // Output to appropriate console method
  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'debug':
      if (isDevelopment) {
        console.debug(formatted);
      }
      break;
    default:
      console.log(formatted);
  }
}

/**
 * Logger instance with convenience methods
 */
export const logger = {
  /**
   * Log informational message
   */
  info(message: string, context?: LogContext): void {
    log('info', message, context);
  },

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    log('warn', message, context);
  },

  /**
   * Log error message
   */
  error(message: string, context?: LogContext, error?: Error): void {
    log('error', message, context, error);
  },

  /**
   * Log debug message (development only)
   */
  debug(message: string, context?: LogContext): void {
    log('debug', message, context);
  },

  /**
   * Log API request
   */
  apiRequest(method: string, path: string, context?: LogContext): void {
    log('info', `API Request: ${method} ${path}`, context);
  },

  /**
   * Log API response
   */
  apiResponse(method: string, path: string, status: number, duration?: number): void {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    log(level, `API Response: ${method} ${path} - ${status}`, {
      statusCode: status,
      durationMs: duration,
    });
  },

  /**
   * Log security event
   */
  security(event: string, context?: LogContext): void {
    log('warn', `Security Event: ${event}`, {
      ...context,
      type: 'security',
    });
  },

  /**
   * Log database operation
   */
  database(operation: string, table: string, context?: LogContext): void {
    log('debug', `Database: ${operation} on ${table}`, context);
  },

  /**
   * Log audit event for compliance and security tracking
   */
  audit(action: string, context?: LogContext): void {
    log('info', `Audit: ${action}`, {
      ...context,
      type: 'audit',
      auditTimestamp: new Date().toISOString(),
    });
  },
};

export default logger;
