import { NextResponse } from 'next/server';

export async function GET() {
  const accessKeyId = process.env.DB_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.DB_SECRET_ACCESS_KEY || '';

  return NextResponse.json({
    accessKeyId: {
      exists: !!accessKeyId,
      length: accessKeyId.length,
      firstChars: accessKeyId.substring(0, 5),
      lastChars: accessKeyId.substring(accessKeyId.length - 3),
      hasWhitespace: accessKeyId !== accessKeyId.trim(),
    },
    secretAccessKey: {
      exists: !!secretAccessKey,
      length: secretAccessKey.length,
      firstChars: secretAccessKey.substring(0, 3),
      hasWhitespace: secretAccessKey !== secretAccessKey.trim(),
    },
    region: process.env.REGION
  });
}
