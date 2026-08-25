import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import User from '@/models/user/User';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
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

    verifyToken(token);

    const users = await User.find({
      role: {
        $in: ['employee', 'accountant'],
      },
    })
      .select('employeeId name email role status')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Permission users error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}