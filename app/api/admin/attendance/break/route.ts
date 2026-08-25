import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import dayjs from 'dayjs';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';

import Attendance from '@/models/attendance/Attendance';
import AttendanceLog from '@/models/attendance/AttendanceLog';
import User from '@/models/user/User';

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

async function getAuthenticatedUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Unauthorized.');
  }

  const payload = verifyToken(token);

  const user = await User.findById(payload.userId)
    .select('_id name employeeId email role status')
    .lean();

  if (!user) {
    throw new Error('User not found.');
  }

  if (user.status !== 'active') {
    throw new Error('User account is inactive.');
  }

  return user;
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
| BREAK_IN
| BREAK_OUT
|--------------------------------------------------------------------------
*/

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser();

    const body = await req.json();

    const { attendanceId, type } = body;

    /*
    |--------------------------------------------------------------------------
    | Validate Type
    |--------------------------------------------------------------------------
    */

    if (!['BREAK_IN', 'BREAK_OUT'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid break type.',
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find Attendance
    |--------------------------------------------------------------------------
    */

    let attendance;

    if (attendanceId) {
      attendance = await Attendance.findOne({
        _id: attendanceId,
        employee: user._id,
      });
    } else {
      attendance = await Attendance.findOne({
        employee: user._id,
        date: {
          $gte: dayjs().startOf('day').toDate(),
          $lte: dayjs().endOf('day').toDate(),
        },
      });
    }

    if (!attendance) {
      return NextResponse.json(
        {
          success: false,
          message: "Today's attendance record not found.",
        },
        { status: 404 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Determine AM / PM Session
    |--------------------------------------------------------------------------
    |
    | Find the session that is currently active.
    |
    */

    const now = new Date();

    let sessionName: 'am' | 'pm' | null = null;

    if (attendance.am?.currentStatus === 'Working' || attendance.am?.currentStatus === 'On Break') {
      sessionName = 'am';
    } else if (
      attendance.pm?.currentStatus === 'Working' ||
      attendance.pm?.currentStatus === 'On Break'
    ) {
      sessionName = 'pm';
    }

    if (!sessionName) {
      return NextResponse.json(
        {
          success: false,
          message: 'No active AM or PM attendance session found.',
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Active Session
    |--------------------------------------------------------------------------
    */

    const session = attendance[sessionName];

    /*
    |--------------------------------------------------------------------------
    | Cannot Break After Checkout
    |--------------------------------------------------------------------------
    */

    if (session.currentStatus === 'Checked Out') {
      return NextResponse.json(
        {
          success: false,
          message: `${sessionName.toUpperCase()} session is already checked out.`,
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | BREAK IN
    |--------------------------------------------------------------------------
    */

    if (type === 'BREAK_IN') {
      /*
      | Already on break
      */

      if (session.currentStatus === 'On Break') {
        return NextResponse.json(
          {
            success: false,
            message: 'You are already on break.',
          },
          { status: 400 }
        );
      }

      /*
      | Must be working
      */

      if (session.currentStatus !== 'Working') {
        return NextResponse.json(
          {
            success: false,
            message: 'You cannot start a break right now.',
          },
          { status: 400 }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Create BREAK_IN Log
      |--------------------------------------------------------------------------
      */

      await AttendanceLog.create({
        employee: user._id,

        attendance: attendance._id,

        dateTime: now,

        type: 'BREAK_IN',

        source: 'Web',

        createdBy: user._id,

        remarks: `${sessionName.toUpperCase()} break started`,
      });

      /*
      |--------------------------------------------------------------------------
      | Update Session
      |--------------------------------------------------------------------------
      */

      session.currentStatus = 'On Break';

      session.lastActivityAt = now;

      attendance.updatedBy = user._id;

      attendance.markModified(sessionName);

      await attendance.save();

      return NextResponse.json({
        success: true,

        message: `${sessionName.toUpperCase()} break started successfully.`,

        session: sessionName,

        data: attendance,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | BREAK OUT
    |--------------------------------------------------------------------------
    */

    if (type === 'BREAK_OUT') {
      /*
      | Must currently be on break
      */

      if (session.currentStatus !== 'On Break') {
        return NextResponse.json(
          {
            success: false,
            message: 'You are not currently on break.',
          },
          { status: 400 }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Find Latest BREAK_IN
      |--------------------------------------------------------------------------
      */

      const breakIn = await AttendanceLog.findOne({
        employee: user._id,

        attendance: attendance._id,

        type: 'BREAK_IN',
      })
        .sort({
          dateTime: -1,
        })
        .lean();

      if (!breakIn) {
        return NextResponse.json(
          {
            success: false,
            message: 'Active break record not found.',
          },
          { status: 400 }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Calculate Break Duration
      |--------------------------------------------------------------------------
      */

      const breakMilliseconds = now.getTime() - new Date(breakIn.dateTime).getTime();

      const breakMinutes = Math.max(0, Math.floor(breakMilliseconds / 60000));

      /*
      |--------------------------------------------------------------------------
      | Create BREAK_OUT Log
      |--------------------------------------------------------------------------
      */

      await AttendanceLog.create({
        employee: user._id,

        attendance: attendance._id,

        dateTime: now,

        type: 'BREAK_OUT',

        source: 'Web',

        createdBy: user._id,

        remarks: `${sessionName.toUpperCase()} break ended`,
      });

      /*
      |--------------------------------------------------------------------------
      | Update Session
      |--------------------------------------------------------------------------
      */

      session.currentStatus = 'Working';

      session.lastActivityAt = now;

      session.breakMinutes = Number(session.breakMinutes || 0) + breakMinutes;

      attendance.updatedBy = user._id;

      attendance.markModified(sessionName);

      await attendance.save();

      return NextResponse.json({
        success: true,

        message: `${sessionName.toUpperCase()} break ended successfully.`,

        session: sessionName,

        data: attendance,

        breakMinutes,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Invalid Request
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid request.',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Attendance Break API Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to update break.';

    const status =
      errorMessage === 'Unauthorized.'
        ? 401
        : errorMessage === 'User not found.'
          ? 401
          : errorMessage === 'User account is inactive.'
            ? 403
            : 500;

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status }
    );
  }
}
