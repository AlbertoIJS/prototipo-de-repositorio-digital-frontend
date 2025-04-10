import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Only handle public paths: login, signup, and verificar
  const isPublicPath = path === '/login' || path === '/signup' || path === '/verificar';

  // For non-public paths, let the client handle authentication
  if (!isPublicPath) {
    return NextResponse.next();
  }

  // Check for token in cookies (we'll add this to cookies in the AuthCheck component)
  const token = request.cookies.get('accessToken')?.value;
  
  // If user is on a public path and has a token, redirect to home
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Only run middleware on these public paths
export const config = {
  matcher: ['/login', '/signup', '/verificar'],
};