import { NextRequest, NextResponse } from 'next/server';
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
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    verifyToken(token);

    const users = await User.find({
      role: {
        $in: ['employee', 'accountant'],
      },
    })
      .select('employeeId name email phone role department designation status')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Role GET error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    verifyToken(token);

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID and role are required',
        },
        { status: 400 }
      );
    }

    if (!['employee', 'accountant'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid role',
        },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      {
        new: true,
        runValidators: true,
      }
    )
      .select('employeeId name email role')
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
      data: user,
    });
  } catch (error: any) {
    console.error('Role PATCH error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to update role',
      },
      { status: 500 }
    );
  }
}
