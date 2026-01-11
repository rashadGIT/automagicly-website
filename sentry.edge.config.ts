/**
 * Sentry Edge Runtime Configuration
 *
 * This file configures Sentry for Edge Runtime (middleware, edge API routes).
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN || undefined,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: false, // Edge runtime - keep logs minimal
  enabled: process.env.NODE_ENV === 'production' || Boolean(SENTRY_DSN),
  environment: process.env.NODE_ENV || 'development',

  beforeSend(event) {
    if (!SENTRY_DSN) return null;

    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }

    return event;
  },
});
