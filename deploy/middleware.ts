import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware for route protection
 * 
 * NOTE: Middleware runs in Edge Runtime, so we can't use Node.js APIs like fs, crypto, etc.
 * We only check for the session cookie existence, not validate it here.
 * Actual session validation happens in the route handlers.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session cookie (Edge Runtime compatible - use request.cookies)
  const sessionToken = request.cookies.get('session_token')?.value;

  // Protect /install route - only accessible if not installed
  // We check for INSTALL_LOCK via environment variable or skip this check in middleware
  // The actual check should be done in the install route handler
  if (pathname.startsWith('/install')) {
    // Skip install protection in middleware - let the route handle it
    return NextResponse.next();
  }

  // Protected routes - check for session cookie
  if (pathname.startsWith('/dashboard')) {
    if (!sessionToken) {
      // Prevent redirect loop: only redirect if not already going to login
      const loginUrl = new URL('/login', request.url);
      // Add return URL to preserve navigation intent
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth routes (already logged in) - redirect to dashboard if session exists
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (sessionToken) {
      // Prevent redirect loop: only redirect if not already going to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/install/:path*'],
};
