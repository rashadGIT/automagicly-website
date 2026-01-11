/**
 * DynamoDB-based rate limiting for distributed environments
 *
 * Replaces in-memory Map with persistent, multi-instance rate limiting
 * using DynamoDB with automatic TTL cleanup.
 */

import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { logger } from './logger';

const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const RATE_LIMIT_MAX = 10; // Max requests per window
const IP_RATE_LIMIT_MAX = 20; // Max requests per IP per window

interface RateLimitRecord {
  identifier: string;
  timestamps: number[];
  expiresAt: number; // TTL for automatic cleanup
}

/**
 * Check if request is within rate limit using DynamoDB
 */
export async function checkRateLimit(
  identifier: string,
  isIp: boolean = false
): Promise<boolean> {
  // Check required environment variables
  if (!process.env.DB_ACCESS_KEY_ID || !process.env.DB_SECRET_ACCESS_KEY) {
    // Fall back to allowing request if DB not configured
    logger.warn('Rate limiting DB not configured, allowing request');
    return true;
  }

  const client = new DynamoDBClient({
    region: process.env.REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.DB_ACCESS_KEY_ID,
      secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
    }
  });

  const now = Date.now();
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
    return true; // Within rate limit

  } catch (error) {
    // Log error but allow request to proceed (fail open for availability)
    logger.error('Rate limit check failed', {}, error as Error);
    return true;
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
