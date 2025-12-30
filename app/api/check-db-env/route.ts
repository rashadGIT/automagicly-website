import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    DB_ACCESS_KEY_ID: process.env.DB_ACCESS_KEY_ID ? '***SET***' : 'undefined',
    DB_SECRET_ACCESS_KEY: process.env.DB_SECRET_ACCESS_KEY ? '***SET***' : 'undefined',
    REGION: process.env.REGION || 'undefined',
    AWS_REGION: process.env.AWS_REGION || 'undefined',
  });
}
