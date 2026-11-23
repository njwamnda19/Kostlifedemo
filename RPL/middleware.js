import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'kostlife_super_secret_jwt_key_fallback';
const key = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('kostlife_token')?.value;

  let isValidUser = false;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, key);
      if (payload && payload.userId) {
        isValidUser = true;
      }
    } catch (e) {
      isValidUser = false;
    }
  }

  const isAuthPage = pathname === '/login' || pathname === '/register';

  // Jika sudah login dan mengakses /login atau /register -> lempar ke dashboard (/)
  if (isAuthPage && isValidUser) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Jika belum login dan mengakses halaman yang butuh auth -> lempar ke /login
  if (!isAuthPage && !isValidUser) {
    // Abaikan static assets dan API routes (API route punya handling error 401 sendiri)
    if (
      !pathname.startsWith('/_next') &&
      !pathname.startsWith('/api') &&
      !pathname.includes('.')
    ) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/keuangan/:path*',
    '/tagihan/:path*',
    '/jadwal/:path*',
    '/profil/:path*',
    '/login',
    '/register',
  ],
};
