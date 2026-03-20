import { NextResponse, type NextRequest } from 'next/server';
import { updateSupabaseSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const response = await updateSupabaseSession(request);
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const hasSupabaseAuthCookie = request.cookies.getAll().some((cookie) => cookie.name.startsWith('sb-'));

    if (!hasSupabaseAuthCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
