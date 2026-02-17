/**
 * DynamoDB-based rate limiting for distributed environments
 *
 * Replaces in-memory Map with persistent, multi-instance rate limiting
 * using DynamoDB with automatic TTL cleanup.
 *
 * Circuit Breaker Pattern: Fails closed (blocks requests) on repeated errors
 * to prevent abuse when rate limiting service is unavailable.
 */

import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { logger } from './logger';
import { RATE_LIMIT } from './constants';

// Rate limit configuration from constants
const RATE_LIMIT_WINDOW = RATE_LIMIT.WINDOW_MS;
const RATE_LIMIT_MAX = RATE_LIMIT.MAX_REQUESTS;
const IP_RATE_LIMIT_MAX = 20; // Max requests per IP per window

// Circuit breaker configuration from constants
const CIRCUIT_BREAKER_THRESHOLD = RATE_LIMIT.CIRCUIT_BREAKER_THRESHOLD;
const CIRCUIT_BREAKER_TIMEOUT = RATE_LIMIT.CIRCUIT_BREAKER_TIMEOUT;

interface RateLimitRecord {
  identifier: string;
  timestamps: number[];
  expiresAt: number; // TTL for automatic cleanup
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

// Circuit breaker state (in-memory for this instance)
const circuitBreaker: CircuitBreakerState = {
  failures: 0,
  lastFailureTime: 0,
  isOpen: false,
};

/**
 * Check if request is within rate limit using DynamoDB
 */
export async function checkRateLimit(
  identifier: string,
  isIp: boolean = false
): Promise<boolean> {
  // Skip rate limiting in CI E2E tests (with dummy GitHub Actions credentials)
  if (process.env.CI === 'true' && process.env.DB_ACCESS_KEY_ID === 'test-key') {
    return true;
  }

  // Check if DB credentials are missing
  if (!process.env.DB_ACCESS_KEY_ID || !process.env.DB_SECRET_ACCESS_KEY) {
    // FAIL CLOSED - Block requests if rate limiting not configured
    logger.error('Rate limiting DB not configured - BLOCKING request for security');
    return false;
  }

  // Check circuit breaker state
  const now = Date.now();
  if (circuitBreaker.isOpen) {
    if (now - circuitBreaker.lastFailureTime > CIRCUIT_BREAKER_TIMEOUT) {
      // Reset circuit breaker after timeout
      circuitBreaker.isOpen = false;
      circuitBreaker.failures = 0;
      logger.info('Circuit breaker reset - attempting rate limit check');
    } else {
      // Circuit still open - FAIL CLOSED
      logger.warn('Circuit breaker open - blocking request', {
        identifier,
        failures: circuitBreaker.failures,
        timeSinceLastFailure: now - circuitBreaker.lastFailureTime,
      });
      return false;
    }
  }

  const client = new DynamoDBClient({
    region: process.env.REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.DB_ACCESS_KEY_ID,
      secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
    }
  });

  const max = isIp ? IP_RATE_LIMIT_MAX : RATE_LIMIT_MAX;
  const tableName = 'automagicly-rate-limits';

  try {
    // Get existing rate limit record
    const getCommand = new GetItemCommand({
      TableName: tableName,
      Key: marshall({ identifier })
    });

    const response = await client.send(getCommand);

    let timestamps: number[] = [];

    if (response.Item) {
      const record = unmarshall(response.Item) as RateLimitRecord;
      timestamps = record.timestamps || [];
    }

    // Filter out timestamps outside the window
    const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);

    // Check if rate limit exceeded
    if (recentTimestamps.length >= max) {
      return false; // Rate limit exceeded
    }

    // Add current timestamp
    recentTimestamps.push(now);

    // Update DynamoDB with new timestamps
    const putCommand = new PutItemCommand({
      TableName: tableName,
      Item: marshall({
        identifier,
        timestamps: recentTimestamps,
        expiresAt: Math.floor((now + RATE_LIMIT_WINDOW) / 1000), // TTL in seconds
      })
    });

    await client.send(putCommand);

    // Success - reset circuit breaker
    circuitBreaker.failures = 0;
    return true; // Within rate limit

  } catch (error) {
    // Increment circuit breaker failure count
    circuitBreaker.failures++;
    circuitBreaker.lastFailureTime = Date.now();

    // Open circuit if threshold reached
    if (circuitBreaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
      circuitBreaker.isOpen = true;
      logger.error('Circuit breaker opened due to repeated failures', {
        failures: circuitBreaker.failures,
        threshold: CIRCUIT_BREAKER_THRESHOLD,
      });
    }

    // Log error and FAIL CLOSED for security
    logger.error('Rate limit check failed - BLOCKING request', {
      identifier,
      failures: circuitBreaker.failures,
      isCircuitOpen: circuitBreaker.isOpen,
    }, error as Error);

    // FAIL CLOSED - Block request on error
    return false;
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;

  // Check various headers for the real IP address
  const forwarded = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip');

  if (forwarded) {
    // x-forwarded-for may contain multiple IPs, use the first one
    return forwarded.split(',')[0].trim();
  }

  return cfConnectingIp || realIp || 'unknown';
}
