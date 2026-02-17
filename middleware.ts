import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Body size limit: 1MB (enough for reviews, chat, etc.)
const MAX_BODY_SIZE = 1024 * 1024; // 1MB in bytes

export async function middleware(req: NextRequest) {
  // Generate unique request ID for tracing (using Web Crypto API for Edge Runtime compatibility)
  const requestId = crypto.randomUUID();
  // Check request body size for POST/PATCH/PUT requests (all routes)
  if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'Request body too large (max 1MB)' },
        { status: 413 } // Payload Too Large
      );
    }
  }

  // Only check authentication for /admin routes (except /admin/login)
  if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/admin/login')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      // Redirect to login page
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Clone request headers and add request ID
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('X-Request-ID', requestId);

  // Create response with request ID
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add request ID to response headers for client visibility
  response.headers.set('X-Request-ID', requestId);

  // Log request in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${requestId}] ${req.method} ${req.nextUrl.pathname}`);
  }

  return response;
}

// Apply to all /admin routes and all /api routes
export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
