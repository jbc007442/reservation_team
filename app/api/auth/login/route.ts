import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import { NextRequest, NextResponse } from 'next/server';

import { signToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';

import Attendance from '@/models/attendance/Attendance';
import AttendanceLog from '@/models/attendance/AttendanceLog';
import User from '@/models/user/User';

const MAX_SESSION_HOURS = 10;

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { name, password } = await req.json();

    /*
    |--------------------------------------------------------------------------
    | Validate Login
    |--------------------------------------------------------------------------
    */

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
    |--------------------------------------------------------------------------
    | Find User
    |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | Check Password
    |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | Check Active User
    |--------------------------------------------------------------------------
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
    | Admin does not create attendance.
    |
    */

    if (user.role !== 'admin') {
      const now = new Date();

      const startOfDay = dayjs(now).startOf('day').toDate();

      const endOfDay = dayjs(now).endOf('day').toDate();

      /*
      |--------------------------------------------------------------------------
      | Determine AM / PM
      |--------------------------------------------------------------------------
      */

      const sessionName: 'am' | 'pm' = now.getHours() < 12 ? 'am' : 'pm';

      /*
      |--------------------------------------------------------------------------
      | Find Today's Attendance
      |--------------------------------------------------------------------------
      */

      let attendance = await Attendance.findOne({
        employee: user._id,

        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      /*
      |--------------------------------------------------------------------------
      | Create Today's Attendance
      |--------------------------------------------------------------------------
      */

      if (!attendance) {
        attendance = await Attendance.create({
          employee: user._id,

          date: startOfDay,

          am: {
            currentStatus: 'Checked Out',
            checkIn: null,
            checkOut: null,
            workingMinutes: 0,
            breakMinutes: 0,
            lastActivityAt: null,
            autoLoggedOut: false,
            autoLogoutAt: null,
          },

          pm: {
            currentStatus: 'Checked Out',
            checkIn: null,
            checkOut: null,
            workingMinutes: 0,
            breakMinutes: 0,
            lastActivityAt: null,
            autoLoggedOut: false,
            autoLogoutAt: null,
          },

          currentStatus: 'Checked Out',

          lastActivityAt: null,

          workingMinutes: 0,

          breakMinutes: 0,

          status: 'Absent',

          approvedBy: null,

          approvedAt: null,

          createdBy: user._id,

          updatedBy: user._id,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Current Session
      |--------------------------------------------------------------------------
      */

      const session = attendance[sessionName];

      /*
      |--------------------------------------------------------------------------
      | Prevent Duplicate Login
      |--------------------------------------------------------------------------
      */

      if (session.currentStatus === 'Working' || session.currentStatus === 'On Break') {
        return NextResponse.json(
          {
            success: false,

            message: `You are already logged in for the ${sessionName.toUpperCase()} session.`,
          },
          { status: 400 }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------------
      |
      | DO NOT RESET:
      |
      | session.workingMinutes
      | session.breakMinutes
      |
      | These are the TOTAL AM/PM values.
      |
      | Every login/logout is recorded separately
      | in AttendanceLog.
      |
      */

      const previousWorkingMinutes = Number(session.workingMinutes || 0);

      const previousBreakMinutes = Number(session.breakMinutes || 0);

      /*
      |--------------------------------------------------------------------------
      | Start New Login Session
      |--------------------------------------------------------------------------
      */

      const autoLogoutAt = new Date(now.getTime() + MAX_SESSION_HOURS * 60 * 60 * 1000);

      session.checkIn = now;

      session.checkOut = null;

      session.currentStatus = 'Working';

      session.lastActivityAt = now;

      /*
      |--------------------------------------------------------------------------
      | Preserve Previous AM / PM Totals
      |--------------------------------------------------------------------------
      */

      session.workingMinutes = previousWorkingMinutes;

      session.breakMinutes = previousBreakMinutes;

      /*
      |--------------------------------------------------------------------------
      | Auto Logout
      |--------------------------------------------------------------------------
      */

      session.autoLoggedOut = false;

      session.autoLogoutAt = autoLogoutAt;

      /*
      |--------------------------------------------------------------------------
      | Overall Attendance
      |--------------------------------------------------------------------------
      */

      attendance.currentStatus = 'Working';

      attendance.lastActivityAt = now;

      attendance.status = 'Present';

      attendance.updatedBy = user._id;

      attendance.markModified(sessionName);

      /*
      |--------------------------------------------------------------------------
      | Save
      |--------------------------------------------------------------------------
      */

      await attendance.save();

      /*
      |--------------------------------------------------------------------------
      | ALWAYS CREATE IN LOG
      |--------------------------------------------------------------------------
      |
      | Every login gets its own IN record.
      |
      */

      await AttendanceLog.create({
        employee: user._id,

        attendance: attendance._id,

        dateTime: now,

        type: 'IN',

        source: 'Web',

        remarks: `${sessionName.toUpperCase()} session started`,

        createdBy: user._id,
      });
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

    /*
    |--------------------------------------------------------------------------
    | Authentication Cookie
    |--------------------------------------------------------------------------
    |
    | JWT = 7 days
    |
    | Attendance session = maximum 10 hours
    |
    */

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
      {
        status: 500,
      }
    );
  }
}
