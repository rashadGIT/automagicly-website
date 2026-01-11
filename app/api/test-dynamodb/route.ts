import { NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export async function GET() {
  try {
    const dbAccessKeyId = process.env.DB_ACCESS_KEY_ID;
    const dbSecretAccessKey = process.env.DB_SECRET_ACCESS_KEY;
    const region = process.env.REGION || 'us-east-1';

    if (!dbAccessKeyId || !dbSecretAccessKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing DB credentials',
        dbAccessKeyId: dbAccessKeyId ? 'SET' : 'MISSING',
        dbSecretAccessKey: dbSecretAccessKey ? 'SET' : 'MISSING',
      });
    }

    const client = new DynamoDBClient({
      region,
      credentials: {
        accessKeyId: dbAccessKeyId,
        secretAccessKey: dbSecretAccessKey,
      }
    });

    const command = new ScanCommand({
      TableName: 'automagicly-reviews',
      Limit: 1
    });

    const response = await client.send(command);
    const reviews = response.Items?.map(item => unmarshall(item)) || [];

    return NextResponse.json({
      success: true,
      message: 'DynamoDB connection successful',
      reviewCount: reviews.length,
      region,
      credentials: {
        accessKeyId: dbAccessKeyId,
        accessKeyIdLength: dbAccessKeyId.length,
        secretKeyLength: dbSecretAccessKey.length,
      }
    });
  } catch (error: any) {
    const dbAccessKeyId = process.env.DB_ACCESS_KEY_ID;
    const dbSecretAccessKey = process.env.DB_SECRET_ACCESS_KEY;

    return NextResponse.json({
      success: false,
      error: 'DynamoDB connection failed',
      errorMessage: error.message,
      errorName: error.name,
      errorCode: error.code || 'UNKNOWN',
      stack: error.stack?.split('\n').slice(0, 3),
      credentials: {
        accessKeyId: dbAccessKeyId || 'MISSING',
        accessKeyIdLength: dbAccessKeyId?.length || 0,
        secretKeyLength: dbSecretAccessKey?.length || 0,
      }
    }, { status: 500 });
  }
}
