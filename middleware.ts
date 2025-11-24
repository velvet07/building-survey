import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/local';
import { existsSync } from 'fs';
import { join } from 'path';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if installation is complete
  const installLockPath = join(process.cwd(), 'app', 'install', 'INSTALL_LOCK');
  const isInstalled = existsSync(installLockPath);

  // Protect /install route - only accessible if not installed
  if (pathname.startsWith('/install')) {
    if (isInstalled) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Get session
  const session = await getSession();

  // Protected routes
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Auth routes (already logged in)
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/install/:path*'],
};
