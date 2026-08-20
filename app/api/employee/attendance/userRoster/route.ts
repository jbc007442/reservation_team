import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';
import Roster from '@/models/attendance/Roster';
import User from '@/models/user/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get token from cookie
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

    // Verify token
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

    // Get userId from new JWT payload
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

    /*
     * Make sure the logged-in user exists
     * and is not an admin.
     */
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

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    /*
     * Fetch only this employee's roster.
     */
    const roster = await Roster.find({
      employee: user._id,
      date: {
        $gte: start,
        $lte: end,
      },
      status: 'active',
    })
      .sort({
        date: 1,
      })
      .lean();

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
