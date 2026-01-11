/**
 * AWS CloudWatch RUM Configuration
 *
 * Real User Monitoring for client-side errors, performance, and HTTP requests.
 * Replaces Sentry with AWS-native monitoring.
 *
 * Features:
 * - Error tracking (JS errors, unhandled promises)
 * - Performance monitoring (page load, web vitals)
 * - HTTP request tracking
 * - X-Ray integration for distributed tracing
 */

import { AwsRum, AwsRumConfig } from 'aws-rum-web';

let rumInstance: AwsRum | null = null;

export function initRUM() {
  // Only initialize in browser and if not already initialized
  if (typeof window === 'undefined' || rumInstance) {
    return rumInstance;
  }

  try {
    const config: AwsRumConfig = {
      sessionSampleRate: 1.0, // 100% sampling in dev, reduce in production
      identityPoolId: 'us-east-1:126eeb24-53e8-4906-a994-38dda48ce9e9',
      endpoint: 'https://dataplane.rum.us-east-1.amazonaws.com',
      telemetries: ['errors', 'performance', 'http'],
      allowCookies: true,
      enableXRay: true, // Enable X-Ray distributed tracing
    };

    const APPLICATION_ID = '6e72ae05-4c33-4213-8bbe-ba2abb74bd5f';
    const APPLICATION_VERSION = '1.0.0';
    const APPLICATION_REGION = 'us-east-1';

    rumInstance = new AwsRum(
      APPLICATION_ID,
      APPLICATION_VERSION,
      APPLICATION_REGION,
      config
    );

    console.log('✅ CloudWatch RUM initialized successfully');

    return rumInstance;
  } catch (error) {
    console.error('Failed to initialize CloudWatch RUM:', error);
    return null;
  }
}

// Helper function to manually record errors (optional)
export function recordError(error: Error, metadata?: Record<string, any>) {
  if (rumInstance) {
    rumInstance.recordError(error);
    if (metadata) {
      rumInstance.recordEvent('error_metadata', metadata);
    }
  }
}

// Helper function to record custom events (optional)
export function recordEvent(eventType: string, metadata: Record<string, any>) {
  if (rumInstance) {
    rumInstance.recordEvent(eventType, metadata);
  }
}

export { rumInstance };
