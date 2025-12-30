import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

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
    return NextResponse.json({
      success: false,
      error: error.message,
      errorName: error.name
    }, { status: 500 });
  }
}
