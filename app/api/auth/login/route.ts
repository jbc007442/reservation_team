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
    | Admin login does NOT create employee attendance.
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
      |
      | Before 12:00 PM = AM
      | 12:00 PM onwards = PM
      |
      */

      const session: 'am' | 'pm' = now.getHours() < 12 ? 'am' : 'pm';

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
      | Create Attendance If Needed
      |--------------------------------------------------------------------------
      */

      if (!attendance) {
        attendance = await Attendance.create({
          employee: user._id,

          date: startOfDay,

          am: {},
          pm: {},

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
      }

      /*
      |--------------------------------------------------------------------------
      | Get Current Session
      |--------------------------------------------------------------------------
      */

      const currentSession = attendance[session];

      /*
      |--------------------------------------------------------------------------
      | Already Working
      |--------------------------------------------------------------------------
      */

      if (currentSession?.currentStatus === 'Working') {
        return NextResponse.json(
          {
            success: false,
            message: `You are already checked in for the ${session.toUpperCase()} session.`,
          },
          { status: 400 }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Start Session
      |--------------------------------------------------------------------------
      */

      const autoLogoutAt = new Date(now.getTime() + MAX_SESSION_HOURS * 60 * 60 * 1000);

      currentSession.checkIn = now;
      currentSession.checkOut = null;

      currentSession.currentStatus = 'Working';

      currentSession.lastActivityAt = now;

      currentSession.workingMinutes = 0;
      currentSession.breakMinutes = 0;

      currentSession.autoLoggedOut = false;
      currentSession.autoLogoutAt = autoLogoutAt;

      attendance.currentStatus = 'Working';
      attendance.lastActivityAt = now;

      attendance.status = 'Present';
      attendance.updatedBy = user._id;

      attendance.markModified(session);

      await attendance.save();

      /*
      |--------------------------------------------------------------------------
      | Attendance Log
      |--------------------------------------------------------------------------
      */

      await AttendanceLog.create({
        employee: user._id,

        attendance: attendance._id,

        dateTime: now,

        type: 'IN',

        source: 'Web',

        remarks: `${session.toUpperCase()} session started`,

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

    response.cookies.set('token', token, {
      httpOnly: true,

      secure: process.env.NODE_ENV === 'production',

      sameSite: 'lax',

      path: '/',

      /*
       * JWT cookie can remain for 7 days.
       * The attendance/session itself is limited to 10 hours.
       */
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