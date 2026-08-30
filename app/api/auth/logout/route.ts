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
    | Clear Authentication Cookie
    |--------------------------------------------------------------------------
    */

    const clearTokenCookie = (response: NextResponse) => {
      response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: new Date(0),
      });

      return response;
    };

    /*
    |--------------------------------------------------------------------------
    | No Token
    |--------------------------------------------------------------------------
    */

    if (!token) {
      return clearTokenCookie(
        NextResponse.json({
          success: true,
          message: 'Logged out successfully.',
        })
      );
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
    | User Not Found
    |--------------------------------------------------------------------------
    */

    if (!user) {
      return clearTokenCookie(
        NextResponse.json({
          success: true,
          message: 'Logged out successfully.',
        })
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Employee Attendance
    |--------------------------------------------------------------------------
    */

    if (user.role !== 'admin') {
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
        | Find Active Session
        |--------------------------------------------------------------------------
        */

        let sessionName: 'am' | 'pm' | null = null;

        /*
         * Check PM first.
         */

        if (
          attendance.pm &&
          (attendance.pm.currentStatus === 'Working' || attendance.pm.currentStatus === 'On Break')
        ) {
          sessionName = 'pm';
        } else if (

        /*
         * Otherwise check AM.
         */
          attendance.am &&
          (attendance.am.currentStatus === 'Working' || attendance.am.currentStatus === 'On Break')
        ) {
          sessionName = 'am';
        }

        /*
        |--------------------------------------------------------------------------
        | Active Session Found
        |--------------------------------------------------------------------------
        */

        if (sessionName) {
          const session = attendance[sessionName];

          /*
          |--------------------------------------------------------------------------
          | Calculate Current Login Duration
          |--------------------------------------------------------------------------
          */

          let currentSessionMinutes = 0;

          if (session.checkIn) {
            currentSessionMinutes = Math.max(
              0,
              Math.floor((now.getTime() - session.checkIn.getTime()) / 60000)
            );
          }

          /*
          |--------------------------------------------------------------------------
          | Current Session Break
          |--------------------------------------------------------------------------
          |
          | session.breakMinutes already contains breaks from this
          | current login session.
          |
          */

          const currentBreakMinutes = Number(session.breakMinutes || 0);

          /*
          |--------------------------------------------------------------------------
          | Current Session Working Time
          |--------------------------------------------------------------------------
          */

          const currentWorkingMinutes = Math.max(0, currentSessionMinutes - currentBreakMinutes);

          /*
          |--------------------------------------------------------------------------
          | IMPORTANT
          |--------------------------------------------------------------------------
          |
          | ADD current login session to existing AM/PM total.
          |
          | Do NOT reset the previous total.
          |
          */

          const previousWorkingMinutes = Number(session.workingMinutes || 0);

          session.workingMinutes = previousWorkingMinutes + currentWorkingMinutes;

          /*
          |--------------------------------------------------------------------------
          | Checkout
          |--------------------------------------------------------------------------
          */

          session.checkOut = now;

          session.currentStatus = 'Checked Out';

          session.lastActivityAt = now;

          /*
          |--------------------------------------------------------------------------
          | Manual Logout
          |--------------------------------------------------------------------------
          */

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
          |--------------------------------------------------------------------------
          | Daily Working Total
          |--------------------------------------------------------------------------
          */

          attendance.workingMinutes =
            Number(attendance.am?.workingMinutes || 0) + Number(attendance.pm?.workingMinutes || 0);

          /*
          |--------------------------------------------------------------------------
          | Daily Break Total
          |--------------------------------------------------------------------------
          */

          attendance.breakMinutes =
            Number(attendance.am?.breakMinutes || 0) + Number(attendance.pm?.breakMinutes || 0);

          attendance.updatedBy = user._id;

          /*
          |--------------------------------------------------------------------------
          | Mark Nested Session Modified
          |--------------------------------------------------------------------------
          */

          attendance.markModified(sessionName);

          /*
          |--------------------------------------------------------------------------
          | Save
          |--------------------------------------------------------------------------
          */

          await attendance.save();

          /*
          |--------------------------------------------------------------------------
          | Create OUT Log
          |--------------------------------------------------------------------------
          |
          | Every logout gets a separate OUT log.
          |
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

    return clearTokenCookie(
      NextResponse.json({
        success: true,
        message: 'Logged out successfully.',
      })
    );
  } catch (error) {
    console.error('Logout API Error:', error);

    const response = NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to logout.',
      },
      {
        status: 500,
      }
    );

    return clearTokenCookie(response);
  }
}

/*
|--------------------------------------------------------------------------
| Cookie Helper
|--------------------------------------------------------------------------
*/

function clearTokenCookie(response: NextResponse) {
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });

  return response;
}
