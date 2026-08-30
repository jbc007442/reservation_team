import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

interface AuthTokenPayload {
  userId: string;
  role: string;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /*
  |--------------------------------------------------------------------------
  | Allow Auth APIs
  |--------------------------------------------------------------------------
  */

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;

  /*
  |--------------------------------------------------------------------------
  | Login / Register
  |--------------------------------------------------------------------------
  */

  if (pathname === '/login' || pathname === '/register') {
    if (!token) {
      return NextResponse.next();
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;

      return NextResponse.redirect(
        new URL(payload.role === 'admin' ? '/admin' : '/dashboard', req.url)
      );
    } catch {
      const response = NextResponse.next();

      response.cookies.delete('token');

      return response;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Protected Routes
  |--------------------------------------------------------------------------
  */

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;

    /*
    |--------------------------------------------------------------------------
    | Validate User ID
    |--------------------------------------------------------------------------
    */

    if (!payload.userId) {
      throw new Error('Invalid token payload');
    }

    /*
    |--------------------------------------------------------------------------
    | Admin Access
    |--------------------------------------------------------------------------
    */

    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    /*
    |--------------------------------------------------------------------------
    | Employee Access
    |--------------------------------------------------------------------------
    */

    if (pathname.startsWith('/dashboard') && payload.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/login', req.url));

    response.cookies.delete('token');

    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login', '/register'],
};
