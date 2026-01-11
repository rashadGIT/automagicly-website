import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { updateReview, deleteReview } from '@/lib/db';
import { reviewUpdateSchema, reviewDeleteSchema } from '@/lib/validation';
import { verifyCsrfToken, isAdmin } from '@/lib/utils';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const requestedStatus = searchParams.get('status');

    // Check authentication and authorization
    const session = await getServerSession(authOptions);

    // Only admin users can request non-approved reviews
    let status = requestedStatus;
    if (!session || !isAdmin(session)) {
      // Force non-admin requests to only see approved reviews
      status = 'approved';
    }

    // Check required environment variables
    if (!process.env.DB_ACCESS_KEY_ID || !process.env.DB_SECRET_ACCESS_KEY) {
      logger.error('Missing DynamoDB credentials', {
        path: '/api/reviews',
        method: 'GET'
      });
      return NextResponse.json({
        reviews: [],
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
    let reviews = response.Items?.map(item => unmarshall(item)) || [];

    // Filter by status if provided
    if (status && status !== 'all') {
      reviews = reviews.filter((r: any) => r.status === status);

      // Filter for approved reviews with 3+ stars
      if (status === 'approved') {
        reviews = reviews.filter((r: any) => r.rating >= 3);
      }
    }

    // Sort by created_at DESC
    reviews.sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0));

    return NextResponse.json({
      reviews,
      count: reviews.length
    });
  } catch (error: any) {
    logger.error('Failed to fetch reviews', {
      path: '/api/reviews',
      method: 'GET',
      status,
    }, error);
    return NextResponse.json({
      reviews: [],
      error: 'Failed to fetch reviews'
    }, { status: 500 });
  }
}

// PATCH /api/reviews - Update review status/featured
export async function PATCH(request: NextRequest) {
  // CSRF Protection
  if (!verifyCsrfToken(request)) {
    logger.security('CSRF validation failed', {
      path: '/api/reviews',
      method: request.method,
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
    });
    return NextResponse.json({
      success: false,
      error: 'Invalid request origin'
    }, { status: 403 });
  }

  // Validate Content-Type
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return NextResponse.json({
      success: false,
      error: 'Content-Type must be application/json'
    }, { status: 400 });
  }

  // Check authentication and admin role
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) {
    return NextResponse.json({
      success: false,
      error: 'Unauthorized - admin access required'
    }, { status: 403 });
  }

  try {
    const body = await request.json();

    // Validate input with zod
    const validation = reviewUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: validation.error.issues
      }, { status: 400 });
    }

    const { id, status, featured } = validation.data;

    // Build update object
    const updates: { status?: 'pending' | 'approved' | 'rejected'; featured?: boolean } = {};

    if (status) {
      updates.status = status;
    }

    if (featured !== undefined) {
      updates.featured = featured;
    }

    // Update in DynamoDB
    const updatedReview = await updateReview(id, updates);

    if (!updatedReview) {
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: status ? `Review ${status}` : 'Review updated',
      review: updatedReview
    });

  } catch (error: any) {
    logger.error('Failed to update review', {
      path: '/api/reviews',
      method: 'PATCH',
    }, error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update review'
    }, { status: 500 });
  }
}

// DELETE /api/reviews - Delete a review
export async function DELETE(request: NextRequest) {
  // CSRF Protection
  if (!verifyCsrfToken(request)) {
    logger.security('CSRF validation failed', {
      path: '/api/reviews',
      method: request.method,
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
    });
    return NextResponse.json({
      success: false,
      error: 'Invalid request origin'
    }, { status: 403 });
  }

  // Check authentication and admin role
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) {
    return NextResponse.json({
      success: false,
      error: 'Unauthorized - admin access required'
    }, { status: 403 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate input with zod
    const validation = reviewDeleteSchema.safeParse({ id });
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: validation.error.issues
      }, { status: 400 });
    }

    // Delete from DynamoDB
    const success = await deleteReview(validation.data.id);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete review'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted'
    });

  } catch (error: any) {
    logger.error('Failed to delete review', {
      path: '/api/reviews',
      method: 'DELETE',
    }, error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete review'
    }, { status: 500 });
  }
}
