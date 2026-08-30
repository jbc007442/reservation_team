import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import User from '@/models/user/User';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';

/*
|--------------------------------------------------------------------------
| Allowed Booking Permissions
|--------------------------------------------------------------------------
*/

const ALLOWED_PERMISSIONS = [
  'booking.query',
  'booking.create',
  'booking.edit',
  'booking.delete',

  // Auth Form
  'booking.authform.view',
  'booking.authform',

  // Auth Form Tabs
  'booking.authform.approval.view',
  'booking.authform.mail.view',
  'booking.authform.billing.view',
  'booking.authform.history.view',
  'booking.authform.notes.view',
  'booking.authform.itinerary.view',

  // DPR
  'booking.dpr',
  'booking.dpr.create',
  'booking.dpr.edit',
  'booking.dpr.delete',
];

/*
|--------------------------------------------------------------------------
| GET USER PERMISSIONS
|--------------------------------------------------------------------------
*/

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

    /*
    |--------------------------------------------------------------------------
    | Verify Logged In User
    |--------------------------------------------------------------------------
    */

    const payload = verifyToken(token);

    const loggedInUser = await User.findById(payload.userId).select('_id role status').lean();

    if (!loggedInUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 401 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Only Admin Can Manage Permissions
    |--------------------------------------------------------------------------
    */

    if (loggedInUser.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          message: 'Your account is inactive',
        },
        { status: 403 }
      );
    }

    if (loggedInUser.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          message: 'Only admin can manage permissions',
        },
        { status: 403 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | User ID
    |--------------------------------------------------------------------------
    */

    const { id } = await params;

    /*
    |--------------------------------------------------------------------------
    | Find User
    |--------------------------------------------------------------------------
    */

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
  } catch (error: unknown) {
    console.error('User permissions GET error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch user permissions',
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| UPDATE USER PERMISSIONS
|--------------------------------------------------------------------------
*/

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

    /*
    |--------------------------------------------------------------------------
    | Verify Logged In User
    |--------------------------------------------------------------------------
    */

    const payload = verifyToken(token);

    const loggedInUser = await User.findById(payload.userId).select('_id role status').lean();

    if (!loggedInUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 401 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Only Admin
    |--------------------------------------------------------------------------
    */

    if (loggedInUser.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          message: 'Your account is inactive',
        },
        { status: 403 }
      );
    }

    if (loggedInUser.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          message: 'Only admin can manage permissions',
        },
        { status: 403 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | User ID
    |--------------------------------------------------------------------------
    */

    const { id } = await params;

    /*
    |--------------------------------------------------------------------------
    | Request Body
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Remove Invalid Permissions
    |--------------------------------------------------------------------------
    */

    const cleanPermissions = [
      ...new Set(
        permissions.filter(
          (permission): permission is string =>
            typeof permission === 'string' && ALLOWED_PERMISSIONS.includes(permission)
        )
      ),
    ];

    /*
    |--------------------------------------------------------------------------
    | Prevent Assigning Permissions To Admin
    |--------------------------------------------------------------------------
    */

    const targetUser = await User.findById(id).select('_id role').lean();

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    if (targetUser.role === 'admin') {
      return NextResponse.json(
        {
          success: false,
          message: 'Admin permissions are controlled by the admin role',
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          permissions: cleanPermissions,
          updatedBy: loggedInUser._id,
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
  } catch (error: unknown) {
    console.error('User permissions PATCH error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update permissions',
      },
      { status: 500 }
    );
  }
}
