import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  // CSP: allow next.js and inline scripts; no external map services
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; font-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co");
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
