import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Get the token from cookies
  const token = request.cookies.get('accessToken');
  const isAuthenticated = !!token;
  const isLoginPage = path === '/login';

  // If the user is not authenticated and not on the login page,
  // redirect to the login page with the current path as the 'from' parameter
  if (!isAuthenticated && !isLoginPage) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', path);
    return NextResponse.redirect(url);
  }

  // If the user is authenticated and trying to access the login page,
  // redirect to the home page
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 