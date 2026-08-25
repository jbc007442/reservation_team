import dayjs from 'dayjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';

import Attendance from '@/models/attendance/Attendance';
import AttendanceLog from '@/models/attendance/AttendanceLog';
import User from '@/models/user/User';

export async function POST() {
  try {
    await connectDB();

    const cookieStore = await cookies();

    const token = cookieStore.get('token')?.value;

    /*
    |--------------------------------------------------------------------------
    | No Token
    |--------------------------------------------------------------------------
    */

    if (!token) {
      const response = NextResponse.json({
        success: true,
        message: 'Logged out successfully.',
      });

      response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: new Date(0),
      });

      return response;
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Token
    |--------------------------------------------------------------------------
    */

    const payload = verifyToken(token);

    const user = await User.findById(payload.userId).select('_id role status').lean();

    /*
    |--------------------------------------------------------------------------
    | Employee Attendance
    |--------------------------------------------------------------------------
    */

    if (user && user.role !== 'admin') {
      const now = new Date();

      const startOfDay = dayjs(now).startOf('day').toDate();

      const endOfDay = dayjs(now).endOf('day').toDate();

      /*
      |--------------------------------------------------------------------------
      | Find Today's Attendance
      |--------------------------------------------------------------------------
      */

      const attendance = await Attendance.findOne({
        employee: user._id,

        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      if (attendance) {
        /*
        |--------------------------------------------------------------------------
        | Determine Active Session
        |--------------------------------------------------------------------------
        |
        | We check PM first because PM is the later session.
        |
        */

        let sessionName: 'am' | 'pm' | null = null;

        if (
          attendance.pm &&
          (attendance.pm.currentStatus === 'Working' || attendance.pm.currentStatus === 'On Break')
        ) {
          sessionName = 'pm';
        } else if (
          attendance.am &&
          (attendance.am.currentStatus === 'Working' || attendance.am.currentStatus === 'On Break')
        ) {
          sessionName = 'am';
        }

        /*
        |--------------------------------------------------------------------------
        | No Active Session
        |--------------------------------------------------------------------------
        */

        if (sessionName) {
          const session = attendance[sessionName];

          /*
          |--------------------------------------------------------------------------
          | Calculate Working Time
          |--------------------------------------------------------------------------
          */

          if (session.checkIn) {
            const totalMinutes = Math.floor((now.getTime() - session.checkIn.getTime()) / 60000);

            session.workingMinutes = Math.max(0, totalMinutes - session.breakMinutes);
          }

          /*
          |--------------------------------------------------------------------------
          | Checkout Session
          |--------------------------------------------------------------------------
          */

          session.checkOut = now;

          session.currentStatus = 'Checked Out';

          session.lastActivityAt = now;

          session.autoLoggedOut = false;

          session.autoLogoutAt = null;

          /*
          |--------------------------------------------------------------------------
          | Update Overall Attendance
          |--------------------------------------------------------------------------
          */

          attendance.currentStatus = 'Checked Out';

          attendance.lastActivityAt = now;

          /*
          | Calculate total working minutes
          */

          attendance.workingMinutes =
            Number(attendance.am?.workingMinutes || 0) + Number(attendance.pm?.workingMinutes || 0);

          /*
          | Calculate total break minutes
          */

          attendance.breakMinutes =
            Number(attendance.am?.breakMinutes || 0) + Number(attendance.pm?.breakMinutes || 0);

          attendance.updatedBy = user._id;

          attendance.markModified(sessionName);

          await attendance.save();

          /*
          |--------------------------------------------------------------------------
          | Attendance OUT Log
          |--------------------------------------------------------------------------
          */

          await AttendanceLog.create({
            employee: user._id,

            attendance: attendance._id,

            dateTime: now,

            type: 'OUT',

            source: 'Web',

            remarks: `${sessionName.toUpperCase()} session checked out`,

            createdBy: user._id,
          });
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Authentication Cookie
    |--------------------------------------------------------------------------
    */

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });

    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error('Logout API Error:', error);

    /*
    |--------------------------------------------------------------------------
    | Always Clear Cookie
    |--------------------------------------------------------------------------
    */

    const response = NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to logout.',
      },
      { status: 500 }
    );

    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    return response;
  }
}
