import { NextResponse } from 'next/server';

export function middleware() {
  // Since Zustand stores auth state in localStorage (client-side only),
  // we handle authentication checks on the client side in each protected page
  // This middleware is here for future enhancements like API route protection
  
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
