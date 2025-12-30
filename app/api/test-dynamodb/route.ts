import { NextResponse } from 'next/server';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';

export async function GET() {
  try {
    console.log('=== DynamoDB Test ===');
    console.log('DB_ACCESS_KEY_ID:', process.env.DB_ACCESS_KEY_ID ? 'SET' : 'NOT SET');
    console.log('DB_SECRET_ACCESS_KEY:', process.env.DB_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');
    console.log('REGION:', process.env.REGION);

    const client = new DynamoDBClient({
      region: process.env.REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.DB_ACCESS_KEY_ID!,
        secretAccessKey: process.env.DB_SECRET_ACCESS_KEY!,
      }
    });

    console.log('Client created, attempting ListTables...');
    const command = new ListTablesCommand({});
    const response = await client.send(command);

    return NextResponse.json({
      success: true,
      tables: response.TableNames,
      credentials: {
        accessKeyId: process.env.DB_ACCESS_KEY_ID?.substring(0, 5) + '***',
        region: process.env.REGION
      }
    });
  } catch (error: any) {
    console.error('DynamoDB test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      errorName: error.name,
      stack: error.stack,
      env: {
        DB_ACCESS_KEY_ID: process.env.DB_ACCESS_KEY_ID ? 'SET' : 'NOT SET',
        DB_SECRET_ACCESS_KEY: process.env.DB_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET',
        REGION: process.env.REGION
      }
    }, { status: 500 });
  }
}
