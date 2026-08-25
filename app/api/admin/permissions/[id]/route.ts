import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import User from '@/models/user/User';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;

    const user = await User.findById(id)
      .select('employeeId name email role permissions status')
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
      data: user,
    });
  } catch (error: any) {
    console.error('User permissions GET error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to fetch user permissions',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;

    const body = await request.json();

    const permissions = body.permissions;

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Permissions must be an array',
        },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          permissions,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .select('employeeId name email role permissions status')
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
      message: 'Permissions updated successfully',
      data: user,
    });
  } catch (error: any) {
    console.error('User permissions PATCH error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to update permissions',
      },
      { status: 500 }
    );
  }
}
