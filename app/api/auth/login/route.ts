// import bcrypt from 'bcryptjs';
// import { NextRequest, NextResponse } from 'next/server';

// import { signToken } from '@/lib/jwt';
// import { connectDB } from '@/lib/mongodb';
// import User from '@/models/user/User';

// export async function POST(req: NextRequest) {
//   try {
//     await connectDB();

//     const { name, password } = await req.json();

//     if (!name || !password) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Username and password are required.',
//         },
//         { status: 400 }
//       );
//     }

//     const user = await User.findOne({
//       name: name.trim(),
//     });

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Invalid username or password.',
//         },
//         { status: 401 }
//       );
//     }

//     const match = await bcrypt.compare(password, user.password);

//     if (!match) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Invalid username or password.',
//         },
//         { status: 401 }
//       );
//     }

//     // Create JWT using userId
//     const token = signToken({
//       userId: user._id.toString(),
//       role: user.role,
//     });

//     const response = NextResponse.json({
//       success: true,
//       message: 'Login successful',
//       role: user.role,
//     });

//     response.cookies.set('token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       path: '/',
//       maxAge: 60 * 60 * 24 * 7,
//     });

//     return response;
//   } catch (error) {
//     console.error('Login API Error:', error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Internal server error',
//       },
//       { status: 500 }
//     );
//   }
// }

import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import { NextRequest, NextResponse } from 'next/server';

import { signToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';

import Attendance from '@/models/attendance/Attendance';
import AttendanceLog from '@/models/attendance/AttendanceLog';
import User from '@/models/user/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { name, password } = await req.json();

    if (!name || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Username and password are required.',
        },
        { status: 400 }
      );
    }

    /*
     * Find user
     */
    const user = await User.findOne({
      name: name.trim(),
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid username or password.',
        },
        { status: 401 }
      );
    }

    /*
     * Check password
     */
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid username or password.',
        },
        { status: 401 }
      );
    }

    /*
     * Check active user
     */
    if (user.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          message: 'Your account is inactive.',
        },
        { status: 403 }
      );
    }

    /*
     |--------------------------------------------------------------------------
     | ATTENDANCE
     |--------------------------------------------------------------------------
     |
     | Admin login should NOT create employee attendance.
     |
     */
    if (user.role !== 'admin') {
      const now = new Date();

      const startOfDay = dayjs(now).startOf('day').toDate();

      const endOfDay = dayjs(now).endOf('day').toDate();

      /*
       * Find today's attendance
       */
      let attendance = await Attendance.findOne({
        employee: user._id,

        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      /*
       * Create attendance if today's record
       * does not exist.
       */
      if (!attendance) {
        attendance = await Attendance.create({
          employee: user._id,

          date: startOfDay,

          checkIn: now,

          checkOut: null,

          currentStatus: 'Working',

          lastActivityAt: now,

          workingMinutes: 0,

          breakMinutes: 0,

          status: 'Present',

          approvedBy: null,

          approvedAt: null,

          createdBy: user._id,

          updatedBy: user._id,
        });

        /*
         * Create IN log
         */
        await AttendanceLog.create({
          employee: user._id,

          attendance: attendance._id,

          dateTime: now,

          type: 'IN',

          source: 'Web',

          createdBy: user._id,
        });
      } else {
        /*
         * Existing attendance
         *
         * If already working or on break,
         * don't create another IN log.
         */
        if (attendance.currentStatus !== 'Working' && attendance.currentStatus !== 'On Break') {
          /*
           * Employee was previously checked out.
           * Start a new attendance session.
           */
          attendance.checkIn = now;

          attendance.checkOut = null;

          attendance.currentStatus = 'Working';

          attendance.lastActivityAt = now;

          attendance.status = 'Present';

          attendance.updatedBy = user._id;

          await attendance.save();

          await AttendanceLog.create({
            employee: user._id,

            attendance: attendance._id,

            dateTime: now,

            type: 'IN',

            source: 'Web',

            createdBy: user._id,
          });
        }
      }
    }

    /*
     |--------------------------------------------------------------------------
     | JWT
     |--------------------------------------------------------------------------
     */

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
    });

    /*
     |--------------------------------------------------------------------------
     | Response
     |--------------------------------------------------------------------------
     */

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      role: user.role,
    });

    response.cookies.set('token', token, {
      httpOnly: true,

      secure: process.env.NODE_ENV === 'production',

      sameSite: 'lax',

      path: '/',

      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}