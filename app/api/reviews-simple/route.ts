import { NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/auth';
import { isAdmin } from '@/lib/utils';
import { logger } from '@/lib/logger';

export async function GET() {
  // Require authentication and admin role for this admin-only endpoint
  const session = await getServerSession(getAuthOptions());
  if (!session) {
    return NextResponse.json({
      success: false,
      error: 'Unauthorized - authentication required'
    }, { status: 401 });
  }

  // Check for admin role
  if (!isAdmin(session)) {
    logger.security('Non-admin attempted to access reviews-simple endpoint', {
      path: '/api/reviews-simple',
      email: session.user?.email,
    });
    return NextResponse.json({
      success: false,
      error: 'Forbidden - admin access required'
    }, { status: 403 });
  }
  try {
    // Check required environment variables
    if (!process.env.DB_ACCESS_KEY_ID || !process.env.DB_SECRET_ACCESS_KEY) {
      logger.error('Missing DynamoDB credentials', {
        path: '/api/reviews-simple',
        method: 'GET'
      });
      return NextResponse.json({
        success: false,
        error: 'Database configuration error'
      }, { status: 500 });
    }

    const client = new DynamoDBClient({
      region: process.env.REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.DB_ACCESS_KEY_ID,
        secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
      }
    });

    const command = new ScanCommand({
      TableName: 'automagicly-reviews',
    });

    const response = await client.send(command);
    const reviews = response.Items?.map(item => unmarshall(item)) || [];

    // Sort by created_at DESC
    reviews.sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0));

    return NextResponse.json({
      success: true,
      reviews,
      count: reviews.length
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    logger.error('Failed to fetch reviews', {
      path: '/api/reviews-simple',
      method: 'GET',
    }, error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch reviews'
    }, { status: 500 });
  }
}
