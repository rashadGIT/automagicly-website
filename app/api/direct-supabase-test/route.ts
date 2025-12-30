import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Create client directly without importing from lib
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    console.log('URL:', supabaseUrl);
    console.log('Key length:', supabaseKey?.length);

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Client created, attempting query...');

    // Try the exact query that works in Supabase
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'approved')
      .gte('rating', 3)
      .order('created_at', { ascending: false });

    console.log('Query completed');
    console.log('Error:', error);
    console.log('Data count:', data?.length);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data || []
    });

  } catch (error: any) {
    console.error('Caught error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
