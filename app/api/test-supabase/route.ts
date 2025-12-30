import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE_ANON_KEY length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);
    console.log('SUPABASE_SERVICE_ROLE_KEY length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length);

    // Try to query the reviews table
    const { data, error, count } = await supabaseAdmin
      .from('reviews')
      .select('*', { count: 'exact', head: false });

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        hint: error.hint,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      reviewsCount: count,
      hasData: data && data.length > 0,
      sampleReview: data && data.length > 0 ? data[0] : null,
      envCheck: {
        urlConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKeyConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceRoleKeyConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      }
    });

  } catch (error: any) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
