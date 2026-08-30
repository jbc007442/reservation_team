import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/user/User';

export async function GET() {
  try {
    /*
    |--------------------------------------------------------------------------
    | Connect Database
    |--------------------------------------------------------------------------
    */

    await connectDB();

    /*
    |--------------------------------------------------------------------------
    | Get Authentication Cookie
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Verify Token
    |--------------------------------------------------------------------------
    */

    const payload = verifyToken(token);

    /*
    |--------------------------------------------------------------------------
    | Get Logged-In User
    |--------------------------------------------------------------------------
    |
    | permissions is included here.
    |
    */

    const user = await User.findById(payload.userId)
      .select('_id employeeId name email role permissions status avatar department designation')
      .lean();

    /*
    |--------------------------------------------------------------------------
    | User Not Found
    |--------------------------------------------------------------------------
    */

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found.',
        },
        { status: 401 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Inactive User
    |--------------------------------------------------------------------------
    */

    if (user.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          message: 'Your account is inactive.',
        },
        { status: 403 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    |
    | Keep `user` because your existing application already expects
    | result.user.
    |
    */

    return NextResponse.json({
      success: true,

      user: {
        _id: user._id.toString(),

        employeeId: user.employeeId,

        name: user.name,

        email: user.email,

        role: user.role,

        permissions: user.permissions || [],

        status: user.status,

        avatar: user.avatar,

        department: user.department,

        designation: user.designation,
      },
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

