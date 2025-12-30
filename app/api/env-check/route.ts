import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
      NEXT_PUBLIC_SUPABASE_ANON_KEY_LENGTH: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      NEXT_PUBLIC_SUPABASE_ANON_KEY_FIRST_20: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) || 'NOT SET',
      SUPABASE_SERVICE_ROLE_KEY_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      SUPABASE_SERVICE_ROLE_KEY_FIRST_20: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
    }
  });
}
