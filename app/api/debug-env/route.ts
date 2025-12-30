import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    DB_HOST: process.env.DB_HOST || 'undefined',
    DB_PORT: process.env.DB_PORT || 'undefined',
    DB_NAME: process.env.DB_NAME || 'undefined',
    DB_USER: process.env.DB_USER || 'undefined',
    DB_PASSWORD: process.env.DB_PASSWORD ? '***SET***' : 'undefined',
    DB_SSL: process.env.DB_SSL || 'undefined',
  });
}
