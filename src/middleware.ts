import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // 1. Refresh Supabase auth session
  let response = await updateSession(request);
  
  // 2. Set Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // 3. Guard Admin Dashboard routes
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin')) {
    const hasSession = request.cookies.getAll().some((cookie) => 
      cookie.name.includes('sb-') && cookie.name.includes('-auth-token')
    );

    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api/health|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|icons|offline.html).*)',
  ],
};
