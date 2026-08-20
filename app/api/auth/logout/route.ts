// import { NextResponse } from 'next/server';

// export async function POST() {
//   const response = NextResponse.json(
//     {
//       success: true,
//       message: 'Logged out successfully.',
//     },
//     { status: 200 }
//   );

//   response.cookies.set('token', '', {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'lax',
//     path: '/',
//     expires: new Date(0),
//   });

//   return response;
// }

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
     * Even if token is missing,
     * still clear the cookie.
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

    const payload = verifyToken(token);

    const user = await User.findById(payload.userId).select('_id role status').lean();

    if (user && user.role !== 'admin') {
      const now = new Date();

      const startOfDay = dayjs(now).startOf('day').toDate();

      const endOfDay = dayjs(now).endOf('day').toDate();

      /*
       * Find today's attendance
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
         * Only checkout if currently working
         * or on break.
         */
        if (attendance.currentStatus === 'Working' || attendance.currentStatus === 'On Break') {
          /*
           * If employee logs out while on break,
           * consider the break ended at logout.
           *
           * For now, we calculate the working
           * duration from check-in.
           */
          if (attendance.checkIn) {
            const totalMinutes = Math.floor((now.getTime() - attendance.checkIn.getTime()) / 60000);

            attendance.workingMinutes = Math.max(0, totalMinutes - attendance.breakMinutes);
          }

          attendance.checkOut = now;

          attendance.currentStatus = 'Checked Out';

          attendance.lastActivityAt = now;

          attendance.updatedBy = user._id;

          await attendance.save();

          /*
           * Attendance OUT log
           */
          await AttendanceLog.create({
            employee: user._id,

            attendance: attendance._id,

            dateTime: now,

            type: 'OUT',

            source: 'Web',

            createdBy: user._id,
          });
        }
      }
    }

    /*
     * Clear login cookie
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
     * Even if attendance update fails,
     * clear authentication cookie.
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