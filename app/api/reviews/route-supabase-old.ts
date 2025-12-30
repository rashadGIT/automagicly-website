import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Type definitions
export interface Review {
  id: string;
  name?: string;
  email?: string;
  company?: string;
  rating: number;
  review_text: string;
  service_type: string;
  status: 'pending' | 'approved' | 'rejected';
  featured?: boolean;
  approval_token?: string;
  token_expires_at?: string;
  created_at: string;
  approved_at?: string;
  updated_at: string;
}

// GET /api/reviews - Fetch reviews
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    // EXACT same approach as direct-supabase-test
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    let query = supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (!status || status === 'approved') {
      query = query.gte('rating', 3);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({
        reviews: [],
        error: 'Failed to fetch reviews'
      }, { status: 500 });
    }

    return NextResponse.json({
      reviews: data || [],
      count: data?.length || 0
    });

  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({
      reviews: [],
      error: error.message
    }, { status: 500 });
  }
}

// PATCH /api/reviews - Update review
export async function PATCH(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const body = await request.json();
    const { id, status, featured } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing review id'
      }, { status: 400 });
    }

    const updates: Partial<Review> = {
      updated_at: new Date().toISOString()
    };

    if (status) {
      if (!['approved', 'rejected', 'pending'].includes(status)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid status'
        }, { status: 400 });
      }
      updates.status = status;
      if (status === 'approved' && !updates.approved_at) {
        updates.approved_at = new Date().toISOString();
      }
    }

    if (featured !== undefined) {
      updates.featured = featured;
    }

    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: status ? `Review ${status}` : 'Review updated',
      review: data
    });

  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE /api/reviews - Delete review
export async function DELETE(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing review id'
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted'
    });

  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
