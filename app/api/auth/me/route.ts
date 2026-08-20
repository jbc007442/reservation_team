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
          message: 'Unauthorized. Token not found.',
        },
        { status: 401 }
      );
    }

    // verifyToken now returns:
    // {
    //   userId: string,
    //   role: string
    // }
    const payload = verifyToken(token);

    const user = await User.findById(payload.userId).select('-password').lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Auth Me API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Unauthorized. Invalid or expired token.',
      },
      { status: 401 }
    );
  }
}
