import { NextResponse } from 'next/server';

function testEnvAccess() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    urlDefined: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    keyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    keyDefined: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    keyFirst20: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || 'UNDEFINED'
  };
}

export async function GET() {
  const fromFunction = testEnvAccess();

  const direct = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    urlDefined: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    keyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    keyDefined: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    keyFirst20: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || 'UNDEFINED'
  };

  return NextResponse.json({
    message: 'Testing env access from function vs direct',
    fromFunction,
    direct,
    areEqual: JSON.stringify(fromFunction) === JSON.stringify(direct)
  });
}
