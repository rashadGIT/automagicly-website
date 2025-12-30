import { NextResponse } from 'next/server';

export async function GET() {
  // Test if we can read the env var in this location
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return NextResponse.json({
    test: 'reviews-env-test',
    hasKey: !!key,
    keyLength: key?.length || 0,
    keyFirst20: key?.substring(0, 20) || 'UNDEFINED',
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE')).sort()
  });
}
