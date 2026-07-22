import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow auth API routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;

  // Login/Register pages
  if (pathname === '/login' || pathname === '/register') {
    if (!token) {
      return NextResponse.next();
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as {
        id: string;
        role: string;
      };

      return NextResponse.redirect(
        new URL(payload.role === 'admin' ? '/admin' : '/dashboard', req.url)
      );
    } catch {
      return NextResponse.next();
    }
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };

    // Admin routes
    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
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
