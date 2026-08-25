import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import dayjs from 'dayjs';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';

import Attendance from '@/models/attendance/Attendance';
import AttendanceLog from '@/models/attendance/AttendanceLog';
import User from '@/models/user/User';

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

export async function GET() {
  try {
    await connectDB();

    const user = await getAuthenticatedUser();

    const startOfDay = dayjs().startOf('day').toDate();
    const endOfDay = dayjs().endOf('day').toDate();

    const attendance = await Attendance.findOne({
      employee: user._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate({
        path: 'employee',
        select: '_id name employeeId email',
      })
      .lean();

    if (!attendance) {
      return NextResponse.json({
        success: true,
        data: null,
        session: null,
        breaks: [],
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Determine current session
    |--------------------------------------------------------------------------
    |
    | Before 12 PM  -> AM
    | 12 PM onward  -> PM
    |
    */

    const currentHour = dayjs().hour();

    const session = currentHour < 12 ? 'am' : 'pm';

    const currentSession = session === 'am' ? attendance.am : attendance.pm;

    /*
    |--------------------------------------------------------------------------
    | Get logs for current session
    |--------------------------------------------------------------------------
    */

    const logs = await AttendanceLog.find({
      employee: user._id,
      attendance: attendance._id,
    })
      .sort({
        dateTime: 1,
      })
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Breaks
    |--------------------------------------------------------------------------
    */

    const breaks: {
      id: string;
      start: string;
      end: string | null;
    }[] = [];

    let activeBreak: {
      id: string;
      start: string;
      end: string | null;
    } | null = null;

    for (const log of logs) {
      /*
       * Only use logs belonging to current session.
       *
       * AM = before 12
       * PM = 12 onward
       */

      const logHour = dayjs(log.dateTime).hour();

      const logSession = logHour < 12 ? 'am' : 'pm';

      if (logSession !== session) {
        continue;
      }

      if (log.type === 'BREAK_IN') {
        activeBreak = {
          id: log._id.toString(),
          start: log.dateTime.toISOString(),
          end: null,
        };
      }

      if (log.type === 'BREAK_OUT' && activeBreak) {
        activeBreak.end = log.dateTime.toISOString();

        breaks.push(activeBreak);

        activeBreak = null;
      }
    }

    if (activeBreak) {
      breaks.push(activeBreak);
    }

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,

      data: attendance,

      session,

      currentSession,

      breaks,
    });
  } catch (error) {
    console.error('Attendance GET API Error:', error);

    const message = error instanceof Error ? error.message : 'Failed to fetch attendance.';

    const status =
      message === 'Unauthorized.'
        ? 401
        : message === 'User not found.'
          ? 401
          : message === 'User account is inactive.'
            ? 403
            : 500;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status,
      }
    );
  }
}
