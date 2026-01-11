/**
 * Sentry Server-Side Configuration
 *
 * This file configures Sentry for error tracking on the server (API routes, SSR).
 *
 * To complete setup:
 * 1. Sign up at https://sentry.io (free tier available)
 * 2. Create a new Next.js project
 * 3. Copy your DSN
 * 4. Add to .env.local:
 *    NEXT_PUBLIC_SENTRY_DSN="https://your-key@sentry.io/your-project-id"
 * 5. Restart your dev server
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN || undefined, // undefined = disabled

  // Adjust this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console
  debug: process.env.NODE_ENV === 'development',

  // Filter out sensitive data
  beforeSend(event, hint) {
    // Don't send events if Sentry is not configured
    if (!SENTRY_DSN) {
      return null;
    }

    // Remove sensitive environment variables from context
    if (event.contexts?.runtime?.env) {
      const sensitiveKeys = [
        'GOOGLE_PRIVATE_KEY',
        'DB_SECRET_ACCESS_KEY',
        'DB_ACCESS_KEY_ID',
        'NEXTAUTH_SECRET',
        'ADMIN_PASSWORD_HASH',
      ];

      const env = event.contexts.runtime.env as Record<string, any>;
      sensitiveKeys.forEach(key => {
        if (env) {
          delete env[key];
        }
      });
    }

    // Remove sensitive request data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }

    // Sanitize error messages that might contain secrets
    if (event.message) {
      const secretPatterns = [
        /AKIA[0-9A-Z]{16}/g, // AWS access keys
        /-----BEGIN [A-Z ]+ KEY-----[\s\S]*?-----END [A-Z ]+ KEY-----/g, // Private keys
        /[a-f0-9]{32,}/gi, // Potential secrets/tokens
      ];

      secretPatterns.forEach(pattern => {
        if (event.message) {
          event.message = event.message.replace(pattern, '[REDACTED]');
        }
      });
    }

    return event;
  },

  // Don't send events in development unless DSN is explicitly set
  enabled: process.env.NODE_ENV === 'production' || Boolean(SENTRY_DSN),

  // Environment configuration
  environment: process.env.NODE_ENV || 'development',

  // Release tracking (optional - requires CI/CD setup)
  // release: process.env.NEXT_PUBLIC_RELEASE_VERSION,

  // Ignore common errors that aren't actionable
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'canvas.contentDocument',
    // Random plugins/extensions
    'atomicFindClose',
    // Network errors
    'NetworkError',
    'Network request failed',
  ],
});

// Log configuration status (development only)
if (process.env.NODE_ENV === 'development') {
  if (SENTRY_DSN) {
    console.log('✅ Sentry server-side tracking enabled');
  } else {
    console.log('ℹ️  Sentry not configured (add NEXT_PUBLIC_SENTRY_DSN to enable)');
  }
}
