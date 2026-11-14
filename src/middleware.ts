import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('sports_meet_token')?.value;

  // Extract host
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0].toLowerCase();

  // Root domains check
  const isApexOrRoot =
    hostname === 'kalolsavam.online' ||
    hostname === 'www.kalolsavam.online' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.vercel.app') && !hostname.includes('---');

  // Check for subdomain
  let tenantSlug: string | null = null;

  if (hostname.endsWith('.kalolsavam.online')) {
    const sub = hostname.replace('.kalolsavam.online', '');
    if (sub !== 'www' && sub.length > 0) {
      tenantSlug = sub;
    }
  } else if (hostname.endsWith('.localhost')) {
    const sub = hostname.replace('.localhost', '');
    if (sub !== 'www' && sub.length > 0) {
      tenantSlug = sub;
    }
  }

  // Developer convenience: Allow ?tenant=slug in URL to simulate subdomain locally
  const queryTenant = request.nextUrl.searchParams.get('tenant');
  if (queryTenant) {
    tenantSlug = queryTenant.toLowerCase();
  }

  const isRoot = !tenantSlug;

  // Prepare forwarded headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-current-host', host);
  requestHeaders.set('x-is-root', isRoot ? 'true' : 'false');
  if (tenantSlug) {
    requestHeaders.set('x-tenant-slug', tenantSlug);
  } else {
    requestHeaders.delete('x-tenant-slug');
  }

  // Protect Super Admin route
  if (pathname.startsWith('/super-admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Admin and Club routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/club')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
