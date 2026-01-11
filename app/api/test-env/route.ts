import { NextResponse } from 'next/server';

export async function GET() {
  // Check which environment variables are actually available at runtime
  const envCheck = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET (length: ' + process.env.NEXTAUTH_SECRET.length + ')' : 'MISSING',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'SET' : 'MISSING',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ? 'SET' : 'MISSING',
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH ? 'SET' : 'MISSING',
    DB_ACCESS_KEY_ID: process.env.DB_ACCESS_KEY_ID ? 'SET' : 'MISSING',
    DB_SECRET_ACCESS_KEY: process.env.DB_SECRET_ACCESS_KEY ? 'SET' : 'MISSING',
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'SET' : 'MISSING',
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ? 'SET (length: ' + process.env.GOOGLE_PRIVATE_KEY.length + ')' : 'MISSING',
    GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID ? 'SET' : 'MISSING',
    REGION: process.env.REGION ? 'SET' : 'MISSING',
    AWS_EXECUTION_ENV: process.env.AWS_EXECUTION_ENV || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
  };

  return NextResponse.json(envCheck);
}
