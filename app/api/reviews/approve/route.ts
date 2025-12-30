import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Email-based approval endpoint with Supabase
// URL: /api/reviews/approve?token=xxx

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse(
      `<html>
        <head><title>Invalid Link</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: #dc2626;">❌ Invalid Approval Link</h1>
          <p>This link is missing required information.</p>
          <a href="/" style="color: #2563eb;">Go to Homepage</a>
        </body>
      </html>`,
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    );
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Find review by token
    const { data: review, error: fetchError } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('approval_token', token)
      .single();

    if (fetchError || !review) {
      return new NextResponse(
        `<html>
          <head><title>Invalid Token</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: #dc2626;">❌ Invalid or Expired Link</h1>
            <p>This approval link is no longer valid.</p>
            <a href="/admin/reviews" style="color: #2563eb;">Go to Admin Dashboard</a>
          </body>
        </html>`,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Check if token is expired
    if (review.token_expires_at && new Date(review.token_expires_at) < new Date()) {
      return new NextResponse(
        `<html>
          <head><title>Token Expired</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: #dc2626;">⏰ Link Expired</h1>
            <p>This approval link has expired (7 days maximum).</p>
            <a href="/admin/reviews" style="color: #2563eb;">Go to Admin Dashboard</a>
          </body>
        </html>`,
        { status: 410, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Update review to approved and clear token
    const { error: updateError } = await supabaseAdmin
      .from('reviews')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approval_token: null, // Clear token (one-time use)
        updated_at: new Date().toISOString()
      })
      .eq('id', review.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Success page
    return new NextResponse(
      `<html>
        <head>
          <title>Review Approved</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0;">
          <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 500px;">
            <div style="font-size: 80px; margin-bottom: 20px;">✅</div>
            <h1 style="color: #059669; margin-bottom: 10px;">Review Approved!</h1>
            <p style="color: #6b7280; font-size: 18px; margin-bottom: 30px;">
              The review from <strong>${review.name || 'Anonymous'}</strong> has been approved and will now appear on your website.
            </p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
              <p style="color: #4b5563; font-size: 14px; margin: 0;">
                ⭐ ${review.rating} stars • ${review.service_type}
              </p>
            </div>
            <a href="/admin/reviews" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 10px;">
              View All Reviews
            </a>
            <a href="/" style="display: inline-block; background: #6b7280; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Go Home
            </a>
          </div>
        </body>
      </html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error: any) {
    console.error('Error approving review:', error);

    return new NextResponse(
      `<html>
        <head><title>Error</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: #dc2626;">❌ Error</h1>
          <p>Failed to approve review: ${error.message}</p>
          <a href="/admin/reviews" style="color: #2563eb;">Go to Admin Dashboard</a>
        </body>
      </html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}
