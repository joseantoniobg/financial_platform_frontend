import { NextRequest, NextResponse } from 'next/server';
import { isTokenExpired } from './lib/auth';
import { getSession } from './lib/session';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const sessionUser = session.user;
  const token = sessionUser?.token;

  if (!token || isTokenExpired(token)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!login|reset-password|forgot-password|api|_next/static|_next/image|favicon.ico|back.jpg).*)',
  ],
};
