// app/api/profile/route.ts

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/user/User';

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const cookieStore = await cookies();

    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
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

    const userId = payload.userId;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Request Body
    |--------------------------------------------------------------------------
    */

    const body = await req.json();

    /*
    |--------------------------------------------------------------------------
    | Update User
    |--------------------------------------------------------------------------
    */

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: body,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      data: user,
    });
  } catch (error) {
    console.error('Profile PUT API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Something went wrong.',
      },
      { status: 500 }
    );
  }
}
