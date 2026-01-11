/**
 * Sentry Client-Side Configuration
 *
 * This file configures Sentry for error tracking in the browser.
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

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      // Additional SDK configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out sensitive data
  beforeSend(event, hint) {
    // Don't send events if Sentry is not configured
    if (!SENTRY_DSN) {
      return null;
    }

    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }

    // Remove sensitive query params
    if (event.request?.query_string && typeof event.request.query_string === 'string') {
      const sensitiveParams = ['token', 'password', 'secret', 'key'];
      sensitiveParams.forEach(param => {
        if (event.request?.query_string && typeof event.request.query_string === 'string') {
          event.request.query_string = event.request.query_string.replace(
            new RegExp(`${param}=[^&]+`, 'gi'),
            `${param}=[REDACTED]`
          );
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
});

// Log configuration status (development only)
if (process.env.NODE_ENV === 'development') {
  if (SENTRY_DSN) {
    console.log('✅ Sentry client-side tracking enabled');
  } else {
    console.log('ℹ️  Sentry not configured (add NEXT_PUBLIC_SENTRY_DSN to enable)');
  }
}
