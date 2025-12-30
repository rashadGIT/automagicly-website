import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand, QueryCommand, UpdateItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';

// GET /api/reviews - Fetch reviews
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const client = new DynamoDBClient({
      region: process.env.REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.DB_ACCESS_KEY_ID!,
        secretAccessKey: process.env.DB_SECRET_ACCESS_KEY!,
      }
    });

    if (status && status !== 'all') {
      // Query by status using GSI
      const command = new QueryCommand({
        TableName: 'automagicly-reviews',
        IndexName: 'status-created_at-index',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': { S: status }
        },
        ScanIndexForward: false
      });

      const response = await client.send(command);
      const reviews = response.Items?.map(item => unmarshall(item)) || [];

      // Filter for approved reviews with 3+ stars
      const filteredReviews = status === 'approved'
        ? reviews.filter((r: any) => r.rating >= 3)
        : reviews;

      return NextResponse.json({
        reviews: filteredReviews,
        count: filteredReviews.length
      });
    } else {
      // Scan all reviews
      const command = new ScanCommand({
        TableName: 'automagicly-reviews'
      });

      const response = await client.send(command);
      const reviews = response.Items?.map(item => unmarshall(item)) || [];
      reviews.sort((a: any, b: any) => b.created_at - a.created_at);

      return NextResponse.json({
        reviews,
        count: reviews.length
      });
    }

  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({
      reviews: [],
      error: error.message
    }, { status: 500 });
  }
}

// PATCH /api/reviews - Update review
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, featured } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing review id'
      }, { status: 400 });
    }

    if (status && !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status'
      }, { status: 400 });
    }

    const client = new DynamoDBClient({
      region: process.env.REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.DB_ACCESS_KEY_ID!,
        secretAccessKey: process.env.DB_SECRET_ACCESS_KEY!,
      }
    });

    const updateExpressions: string[] = ['#updated_at = :updated_at'];
    const expressionAttributeNames: Record<string, string> = {
      '#updated_at': 'updated_at'
    };
    const expressionAttributeValues: any = {
      ':updated_at': Date.now()
    };

    if (status !== undefined) {
      updateExpressions.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = status;

      if (status === 'approved') {
        updateExpressions.push('#approved_at = :approved_at');
        expressionAttributeNames['#approved_at'] = 'approved_at';
        expressionAttributeValues[':approved_at'] = Date.now();
      }
    }

    if (featured !== undefined) {
      updateExpressions.push('#featured = :featured');
      expressionAttributeNames['#featured'] = 'featured';
      expressionAttributeValues[':featured'] = featured;
    }

    const command = new UpdateItemCommand({
      TableName: 'automagicly-reviews',
      Key: marshall({ id }),
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ReturnValues: 'ALL_NEW'
    });

    const response = await client.send(command);
    const review = response.Attributes ? unmarshall(response.Attributes) : null;

    if (!review) {
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: status ? `Review ${status}` : 'Review updated',
      review
    });

  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE /api/reviews - Delete review
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing review id'
      }, { status: 400 });
    }

    const client = new DynamoDBClient({
      region: process.env.REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.DB_ACCESS_KEY_ID!,
        secretAccessKey: process.env.DB_SECRET_ACCESS_KEY!,
      }
    });

    const command = new DeleteItemCommand({
      TableName: 'automagicly-reviews',
      Key: marshall({ id })
    });

    await client.send(command);

    return NextResponse.json({
      success: true,
      message: 'Review deleted'
    });

  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
