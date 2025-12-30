import { NextRequest, NextResponse } from 'next/server';
import { getReviews, updateReview, deleteReview } from '@/lib/db';

// GET /api/reviews - Fetch reviews
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const reviews = await getReviews(status || undefined);

    return NextResponse.json({
      reviews,
      count: reviews.length
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
    const body = await request.json();
    const { id, status, featured } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing review id'
      }, { status: 400 });
    }

    if (status && !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status'
      }, { status: 400 });
    }

    const updates: { status?: 'pending' | 'approved' | 'rejected'; featured?: boolean } = {};
    if (status) updates.status = status;
    if (featured !== undefined) updates.featured = featured;

    const review = await updateReview(id, updates);

    if (!review) {
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: status ? `Review ${status}` : 'Review updated',
      review
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing review id'
      }, { status: 400 });
    }

    const deleted = await deleteReview(id);

    if (!deleted) {
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
