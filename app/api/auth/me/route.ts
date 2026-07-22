import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/user/User';

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();

    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
        },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    // verifyToken may return a string or an object (JwtPayload). Ensure we have an object with an id.
    if (
      typeof payload === 'string' ||
      !payload ||
      typeof payload !== 'object' ||
      !('id' in payload)
    ) {
      return NextResponse.json(
        {
          success: false,
        },
        { status: 401 }
      );
    }

    const userId = (payload as any).id;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json(
        {
          success: false,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
      },
      { status: 401 }
    );
  }
}
