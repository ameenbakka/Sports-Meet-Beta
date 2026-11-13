import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const searchParams = request.nextUrl.searchParams;

  // 1. Resolve Tenant Slug
  let tenantSlug = searchParams.get('tenant');
  if (!tenantSlug) {
    const parts = host.split(':')[0].split('.');
    if (parts.length >= 2) {
      const sub = parts[0].toLowerCase();
      if (sub !== 'www' && sub !== 'localhost' && sub !== 'sportsmeet') {
        tenantSlug = sub;
      }
    }
  }

  if (!tenantSlug) {
    tenantSlug = 'cherukavu'; // Default fallback
  }

  const response = NextResponse.next();
  response.headers.set('x-tenant-slug', tenantSlug);

  // 2. Auth Guards for protected routes
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('sports_meet_token')?.value;

  if (pathname.startsWith('/admin') || pathname.startsWith('/club')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
