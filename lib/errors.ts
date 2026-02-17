/**
 * Structured error handling for API responses
 * Provides consistent error codes and messages across the application
 */

/**
 * Custom application error class with error codes
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert to JSON response format
   */
  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        ...(this.context && { context: this.context }),
      },
    };
  }
}

/**
 * Standard error codes for the application
 */
export const ErrorCodes = {
  // Authentication & Authorization
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  RATE_LIMIT_SERVICE_UNAVAILABLE: 'RATE_LIMIT_SERVICE_UNAVAILABLE',

  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PHONE: 'INVALID_PHONE',

  // Resources
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

  // Audit
  AUDIT_SESSION_NOT_FOUND: 'AUDIT_SESSION_NOT_FOUND',
  AUDIT_SESSION_EXPIRED: 'AUDIT_SESSION_EXPIRED',
  AUDIT_INVALID_STATE: 'AUDIT_INVALID_STATE',
  AUDIT_PROCESSING_FAILED: 'AUDIT_PROCESSING_FAILED',

  // Chat
  CHAT_MESSAGE_TOO_LONG: 'CHAT_MESSAGE_TOO_LONG',
  CHAT_INVALID_MESSAGE: 'CHAT_INVALID_MESSAGE',

  // File Upload
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_TYPE_NOT_ALLOWED: 'FILE_TYPE_NOT_ALLOWED',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',

  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  N8N_WEBHOOK_ERROR: 'N8N_WEBHOOK_ERROR',
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',

  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
  DATABASE_CONNECTION_FAILED: 'DATABASE_CONNECTION_FAILED',

  // General
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  BAD_REQUEST: 'BAD_REQUEST',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
} as const;

/**
 * Factory functions for common errors
 */
export const createError = {
  /**
   * Authentication required
   */
  authRequired: (message = 'Authentication required') =>
    new AppError(message, ErrorCodes.AUTH_REQUIRED, 401),

  /**
   * Invalid credentials
   */
  invalidCredentials: (message = 'Invalid credentials') =>
    new AppError(message, ErrorCodes.AUTH_INVALID_CREDENTIALS, 401),

  /**
   * Rate limit exceeded
   */
  rateLimitExceeded: (message = 'Too many requests. Please try again later.') =>
    new AppError(message, ErrorCodes.RATE_LIMIT_EXCEEDED, 429),

  /**
   * Validation failed
   */
  validationFailed: (message: string, context?: Record<string, any>) =>
    new AppError(message, ErrorCodes.VALIDATION_FAILED, 400, context),

  /**
   * Resource not found
   */
  notFound: (resource: string) =>
    new AppError(`${resource} not found`, ErrorCodes.RESOURCE_NOT_FOUND, 404),

  /**
   * Internal server error
   */
  internal: (message = 'Internal server error') =>
    new AppError(message, ErrorCodes.INTERNAL_SERVER_ERROR, 500),

  /**
   * Bad request
   */
  badRequest: (message: string) =>
    new AppError(message, ErrorCodes.BAD_REQUEST, 400),

  /**
   * Payload too large
   */
  payloadTooLarge: (message = 'Request payload too large') =>
    new AppError(message, ErrorCodes.PAYLOAD_TOO_LARGE, 413),

  /**
   * Method not allowed
   */
  methodNotAllowed: (method: string) =>
    new AppError(`Method ${method} not allowed`, ErrorCodes.METHOD_NOT_ALLOWED, 405),
};

/**
 * Error handler for API routes
 * Converts errors to standardized JSON responses
 */
export function handleApiError(error: unknown): { status: number; body: any } {
  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: error.toJSON(),
    };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      status: 500,
      body: {
        error: {
          message: error.message,
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
        },
      },
    };
  }

  // Handle unknown errors
  return {
    status: 500,
    body: {
      error: {
        message: 'An unexpected error occurred',
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
      },
    },
  };
}
