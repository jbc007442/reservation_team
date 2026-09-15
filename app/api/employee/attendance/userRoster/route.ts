import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';

import Roster from '@/models/attendance/Roster';
import User from '@/models/user/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // ---------------------------------------------------------
    // Get token from cookie
    // ---------------------------------------------------------
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

    // ---------------------------------------------------------
    // Verify JWT
    // ---------------------------------------------------------
    let payload;

    try {
      payload = verifyToken(token);
    } catch (error) {
      console.error('Roster token verification error:', error);

      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Invalid or expired token.',
        },
        { status: 401 }
      );
    }

    // ---------------------------------------------------------
    // Get logged-in user ID
    // ---------------------------------------------------------
    const userId = payload.userId;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. User ID missing from token.',
        },
        { status: 401 }
      );
    }

    // ---------------------------------------------------------
    // Make sure employee exists and is not admin
    // ---------------------------------------------------------
    const user = await User.findOne({
      _id: userId,
      role: {
        $ne: 'admin',
      },
    })
      .select('_id employeeId name email role department designation avatar status')
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Employee not found.',
        },
        { status: 404 }
      );
    }

    // ---------------------------------------------------------
    // Get date range
    // ---------------------------------------------------------
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: 'startDate and endDate are required.',
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // Validate dates
    // ---------------------------------------------------------
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid date range.',
        },
        { status: 400 }
      );
    }

    if (start > end) {
      return NextResponse.json(
        {
          success: false,
          message: 'startDate cannot be greater than endDate.',
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // Fetch employee roster
    //
    // New Roster model:
    //
    // status       = common attendance status
    // rosterStatus = active / inactive
    // ---------------------------------------------------------
    const roster = await Roster.find({
      employee: user._id,
      date: {
        $gte: start,
        $lte: end,
      },

      // IMPORTANT:
      // rosterStatus is now active/inactive.
      rosterStatus: 'active',
    })
      .select('_id employee date status rosterStatus')
      .sort({
        date: 1,
      })
      .lean();

    // ---------------------------------------------------------
    // Return response
    // ---------------------------------------------------------
    return NextResponse.json({
      success: true,
      employee: user,
      count: roster.length,
      data: roster,
    });
  } catch (error) {
    console.error('My Roster GET API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch roster.',
      },
      { status: 500 }
    );
  }
}
