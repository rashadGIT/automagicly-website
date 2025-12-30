import { NextRequest, NextResponse } from 'next/server';
import { getPool, type Review } from '@/lib/db';

// GET /api/reviews - Fetch reviews
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const pool = getPool();

    let query = 'SELECT * FROM reviews';
    const params: any[] = [];
    const conditions: string[] = [];

    // Filter by status if provided
    if (status && status !== 'all') {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    // For public requests, only show approved reviews with 3+ stars
    if (!status || status === 'approved') {
      conditions.push(`rating >= $${params.length + 1}`);
      params.push(3);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    return NextResponse.json({
      reviews: result.rows,
      count: result.rows.length
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
    const pool = getPool();
    const body = await request.json();
    const { id, status, featured } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing review id'
      }, { status: 400 });
    }

    const updates: string[] = ['updated_at = CURRENT_TIMESTAMP'];
    const params: any[] = [];

    if (status) {
      if (!['approved', 'rejected', 'pending'].includes(status)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid status'
        }, { status: 400 });
      }
      params.push(status);
      updates.push(`status = $${params.length}`);

      if (status === 'approved') {
        updates.push('approved_at = CURRENT_TIMESTAMP');
      }
    }

    if (featured !== undefined) {
      params.push(featured);
      updates.push(`featured = $${params.length}`);
    }

    params.push(id);
    const query = `
      UPDATE reviews
      SET ${updates.join(', ')}
      WHERE id = $${params.length}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: status ? `Review ${status}` : 'Review updated',
      review: result.rows[0]
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
    const pool = getPool();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing review id'
      }, { status: 400 });
    }

    const result = await pool.query(
      'DELETE FROM reviews WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 });
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
