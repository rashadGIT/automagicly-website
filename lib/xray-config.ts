/**
 * AWS X-Ray Configuration
 *
 * Distributed tracing for API routes and backend services.
 * Integrates with CloudWatch RUM for end-to-end visibility.
 *
 * Features:
 * - Automatic request tracing
 * - DynamoDB operation tracking
 * - Error and exception capture
 * - Performance metrics
 */

import AWSXRay from 'aws-xray-sdk-core';

// Configure X-Ray
if (process.env.NODE_ENV === 'production') {
  // In production, enable X-Ray
  AWSXRay.setContextMissingStrategy('LOG_ERROR');
} else {
  // In development, use silent mode (no daemon required)
  AWSXRay.setContextMissingStrategy('IGNORE_ERROR');
}

/**
 * Wrap DynamoDB client with X-Ray tracing
 * This automatically traces all DynamoDB operations
 */
export function traceDynamoDB<T>(client: T): T {
  if (process.env.NODE_ENV === 'production') {
    return AWSXRay.captureAWSv3Client(client as any) as T;
  }
  return client;
}

/**
 * Create a custom subsegment for tracing specific operations
 *
 * Example usage:
 * await traceAsync('validateInput', async (subsegment) => {
 *   subsegment?.addMetadata('userId', userId);
 *   return await validateUserInput(data);
 * });
 */
export async function traceAsync<T>(
  name: string,
  fn: (subsegment?: AWSXRay.Subsegment) => Promise<T>
): Promise<T> {
  if (process.env.NODE_ENV === 'production') {
    const segment = AWSXRay.getSegment();
    if (segment) {
      const subsegment = segment.addNewSubsegment(name);
      try {
        const result = await fn(subsegment);
        subsegment.close();
        return result;
      } catch (error) {
        subsegment.addError(error as Error);
        subsegment.close();
        throw error;
      }
    }
  }
  return fn();
}

/**
 * Add custom metadata to the current trace segment
 * Useful for debugging and filtering traces
 */
export function addTraceMetadata(key: string, value: any): void {
  if (process.env.NODE_ENV === 'production') {
    const segment = AWSXRay.getSegment();
    if (segment) {
      segment.addMetadata(key, value);
    }
  }
}

/**
 * Add custom annotation to the current trace segment
 * Annotations are indexed and can be used for filtering in X-Ray console
 */
export function addTraceAnnotation(key: string, value: string | number | boolean): void {
  if (process.env.NODE_ENV === 'production') {
    const segment = AWSXRay.getSegment();
    if (segment) {
      segment.addAnnotation(key, value);
    }
  }
}

export { AWSXRay };
