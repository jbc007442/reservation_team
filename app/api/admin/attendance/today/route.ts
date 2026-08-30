import dayjs from 'dayjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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
| GET
|--------------------------------------------------------------------------
| Today's Attendance
|--------------------------------------------------------------------------
|
| Also checks the 10-hour automatic logout.
|
*/

export async function GET() {
  try {
    await connectDB();

    const user = await getAuthenticatedUser();

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

    /*
    |--------------------------------------------------------------------------
    | No Attendance
    |--------------------------------------------------------------------------
    */

    if (!attendance) {
      return NextResponse.json({
        success: true,

        data: null,

        session: null,

        currentSession: null,

        breaks: [],
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Determine Current AM / PM Session
    |--------------------------------------------------------------------------
    |
    | Before 12:00 PM = AM
    | 12:00 PM onwards = PM
    |
    */

    const session: 'am' | 'pm' = now.getHours() < 12 ? 'am' : 'pm';

    const currentSession = attendance[session];

    /*
    |--------------------------------------------------------------------------
    | Automatic 10 Hour Logout
    |--------------------------------------------------------------------------
    */

    let autoLoggedOut = false;

    if (
      currentSession &&
      (currentSession.currentStatus === 'Working' || currentSession.currentStatus === 'On Break') &&
      currentSession.autoLogoutAt &&
      now >= new Date(currentSession.autoLogoutAt)
    ) {
      /*
      |--------------------------------------------------------------------------
      | Calculate Break If Employee Is Currently On Break
      |--------------------------------------------------------------------------
      */

      if (currentSession.currentStatus === 'On Break') {
        const breakIn = await AttendanceLog.findOne({
          employee: user._id,

          attendance: attendance._id,

          type: 'BREAK_IN',

          dateTime: {
            $gte: currentSession.checkIn || startOfDay,
            $lte: now,
          },
        })
          .sort({
            dateTime: -1,
          })
          .lean();

        if (breakIn) {
          const breakMinutes = Math.max(
            0,
            Math.floor((now.getTime() - new Date(breakIn.dateTime).getTime()) / 60000)
          );

          currentSession.breakMinutes = Number(currentSession.breakMinutes || 0) + breakMinutes;

          /*
          |--------------------------------------------------------------------------
          | Create automatic BREAK_OUT log
          |--------------------------------------------------------------------------
          */

          await AttendanceLog.create({
            employee: user._id,

            attendance: attendance._id,

            dateTime: now,

            type: 'BREAK_OUT',

            source: 'API',

            remarks: `${session.toUpperCase()} break automatically ended because session expired`,

            createdBy: user._id,
          });
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Calculate Final Working Minutes
      |--------------------------------------------------------------------------
      */

      if (currentSession.checkIn) {
        const totalMinutes = Math.floor(
          (now.getTime() - new Date(currentSession.checkIn).getTime()) / 60000
        );

        currentSession.workingMinutes = Math.max(
          0,
          totalMinutes - Number(currentSession.breakMinutes || 0)
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Automatically Checkout
      |--------------------------------------------------------------------------
      */

      currentSession.checkOut = now;

      currentSession.currentStatus = 'Checked Out';

      currentSession.lastActivityAt = now;

      currentSession.autoLoggedOut = true;

      currentSession.autoLogoutAt = null;

      /*
      |--------------------------------------------------------------------------
      | Update Overall Attendance
      |--------------------------------------------------------------------------
      */

      attendance.currentStatus = 'Checked Out';

      attendance.lastActivityAt = now;

      attendance.workingMinutes =
        Number(attendance.am?.workingMinutes || 0) + Number(attendance.pm?.workingMinutes || 0);

      attendance.breakMinutes =
        Number(attendance.am?.breakMinutes || 0) + Number(attendance.pm?.breakMinutes || 0);

      attendance.updatedBy = user._id;

      attendance.markModified(session);

      await attendance.save();

      /*
      |--------------------------------------------------------------------------
      | Create Automatic OUT Log
      |--------------------------------------------------------------------------
      */

      await AttendanceLog.create({
        employee: user._id,

        attendance: attendance._id,

        dateTime: now,

        type: 'OUT',

        source: 'API',

        remarks: `${session.toUpperCase()} session automatically logged out after 10 hours`,

        createdBy: user._id,
      });

      autoLoggedOut = true;
    }

    /*
    |--------------------------------------------------------------------------
    | Get Attendance Logs
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
    | Build Break History
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
      |--------------------------------------------------------------------------
      | Only Current Session
      |--------------------------------------------------------------------------
      */

      const logHour = dayjs(log.dateTime).hour();

      const logSession: 'am' | 'pm' = logHour < 12 ? 'am' : 'pm';

      if (logSession !== session) {
        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | BREAK IN
      |--------------------------------------------------------------------------
      */

      if (log.type === 'BREAK_IN') {
        activeBreak = {
          id: log._id.toString(),

          start: new Date(log.dateTime).toISOString(),

          end: null,
        };
      }

      /*
      |--------------------------------------------------------------------------
      | BREAK OUT
      |--------------------------------------------------------------------------
      */

      if (log.type === 'BREAK_OUT' && activeBreak) {
        activeBreak.end = new Date(log.dateTime).toISOString();

        breaks.push(activeBreak);

        activeBreak = null;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Active Break
    |--------------------------------------------------------------------------
    */

    if (activeBreak) {
      breaks.push(activeBreak);
    }

    /*
    |--------------------------------------------------------------------------
    | Populate Employee
    |--------------------------------------------------------------------------
    */

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate({
        path: 'employee',

        select: '_id name employeeId email',
      })
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Get Updated Current Session
    |--------------------------------------------------------------------------
    */

    const updatedSession = session === 'am' ? populatedAttendance?.am : populatedAttendance?.pm;

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,

      data: populatedAttendance,

      session,

      currentSession: updatedSession,

      breaks,

      autoLoggedOut,
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
