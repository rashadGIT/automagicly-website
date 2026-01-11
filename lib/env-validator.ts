/**
 * Environment Variable Validator
 *
 * Validates that all required environment variables are set at application startup.
 * Fails fast with clear error messages instead of silent failures at runtime.
 *
 * This prevents:
 * - Production deployments with missing configuration
 * - Runtime errors from undefined environment variables
 * - Silent authentication failures
 * - Database connection errors
 */

interface EnvValidationError {
  variable: string;
  message: string;
}

/**
 * Validate all required environment variables
 * @throws Error with detailed message if any required variables are missing
 */
export function validateEnvironmentVariables(): void {
  const errors: EnvValidationError[] = [];
  const isProduction = process.env.NODE_ENV === 'production';

  // Critical authentication variables (required in all environments)
  if (!process.env.NEXTAUTH_SECRET) {
    errors.push({
      variable: 'NEXTAUTH_SECRET',
      message: 'Required for session encryption. Generate with: openssl rand -base64 32',
    });
  } else if (process.env.NEXTAUTH_SECRET.length < 32) {
    errors.push({
      variable: 'NEXTAUTH_SECRET',
      message: 'Must be at least 32 characters long for security',
    });
  }

  if (!process.env.NEXTAUTH_URL && isProduction) {
    errors.push({
      variable: 'NEXTAUTH_URL',
      message: 'Required in production (e.g., https://yourdomain.com)',
    });
  }

  // Admin credentials (required in all environments)
  if (!process.env.ADMIN_EMAIL) {
    errors.push({
      variable: 'ADMIN_EMAIL',
      message: 'Required for admin authentication',
    });
  }

  if (!process.env.ADMIN_PASSWORD_HASH) {
    errors.push({
      variable: 'ADMIN_PASSWORD_HASH',
      message: 'Required for admin authentication. Generate with bcrypt.',
    });
  }

  // Database credentials (required for DynamoDB access)
  if (!process.env.DB_ACCESS_KEY_ID) {
    errors.push({
      variable: 'DB_ACCESS_KEY_ID',
      message: 'Required for DynamoDB access',
    });
  }

  if (!process.env.DB_SECRET_ACCESS_KEY) {
    errors.push({
      variable: 'DB_SECRET_ACCESS_KEY',
      message: 'Required for DynamoDB access',
    });
  }

  // Google Calendar credentials (required for availability checking)
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    errors.push({
      variable: 'GOOGLE_SERVICE_ACCOUNT_EMAIL',
      message: 'Required for Google Calendar integration',
    });
  }

  if (!process.env.GOOGLE_PRIVATE_KEY) {
    errors.push({
      variable: 'GOOGLE_PRIVATE_KEY',
      message: 'Required for Google Calendar integration',
    });
  }

  if (!process.env.GOOGLE_CALENDAR_ID) {
    errors.push({
      variable: 'GOOGLE_CALENDAR_ID',
      message: 'Required for Google Calendar integration',
    });
  }

  // Optional but recommended variables (warnings only)
  const warnings: string[] = [];

  if (!process.env.REGION) {
    warnings.push('REGION not set, defaulting to us-east-1');
  }

  if (!process.env.NEXT_PUBLIC_SENTRY_DSN && isProduction) {
    warnings.push('NEXT_PUBLIC_SENTRY_DSN not set, error tracking disabled');
  }

  // Log warnings (if any)
  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment Variable Warnings:');
    warnings.forEach(warning => {
      console.warn(`   - ${warning}`);
    });
    console.warn('');
  }

  // If there are errors, throw with detailed message
  if (errors.length > 0) {
    const errorMessage = [
      '\n❌ Missing Required Environment Variables:\n',
      ...errors.map(
        err => `   ${err.variable}:\n      ${err.message}`
      ),
      '\n📝 Please check your .env.local file and ensure all required variables are set.',
      '   See .env.example for reference.\n',
    ].join('\n');

    throw new Error(errorMessage);
  }

  // Success message (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ All required environment variables are set');
  }
}

/**
 * Validate specific server-side environment variables
 * Use this in API routes that require specific credentials
 */
export function validateServerEnv(required: string[]): void {
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required server environment variables: ${missing.join(', ')}`
    );
  }
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in test environment
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}
