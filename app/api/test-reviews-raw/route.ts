import { NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export async function GET() {
  try {
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
    const reviews = response.Items?.map(item => unmarshall(item)) || [];

    return NextResponse.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      errorName: error.name
    }, { status: 500 });
  }
}
