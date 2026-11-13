import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const searchParams = request.nextUrl.searchParams;

  // 1. Resolve Tenant Slug
  let tenantSlug = searchParams.get('tenant');
  if (!tenantSlug) {
    const cleanHost = host.split(':')[0].toLowerCase();
    const parts = cleanHost.split('.');

    if (cleanHost.includes('vercel.app')) {
      // e.g. <subdomain>.<project>.vercel.app (4 parts)
      if (parts.length > 3) {
        tenantSlug = parts[0];
      } else {
        tenantSlug = 'cherukavu';
      }
    } else if (cleanHost.includes('localhost')) {
      if (parts.length >= 2 && parts[0] !== 'localhost') {
        tenantSlug = parts[0];
      } else {
        tenantSlug = 'cherukavu';
      }
    } else if (parts.length >= 3) {
      // e.g. <subdomain>.sportsmeet.online (3 parts)
      const sub = parts[0];
      if (sub !== 'www') {
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
