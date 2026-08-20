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
     * Validate type
     */

    if (!['BREAK_IN', 'BREAK_OUT'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid break type.',
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Find attendance
     */

    let attendance;

    if (attendanceId) {
      attendance = await Attendance.findOne({
        _id: attendanceId,
        employee: user._id,
      });
    } else {
      /*
       * Fallback: today's attendance
       */

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
        {
          status: 404,
        }
      );
    }

    /*
     * Cannot break after checkout
     */

    if (attendance.currentStatus === 'Checked Out') {
      return NextResponse.json(
        {
          success: false,
          message: 'Attendance is already checked out.',
        },
        {
          status: 400,
        }
      );
    }

    /*
     * BREAK IN
     */

    if (type === 'BREAK_IN') {
      /*
       * Already on break
       */

      if (attendance.currentStatus === 'On Break') {
        return NextResponse.json(
          {
            success: false,
            message: 'You are already on break.',
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Must be working
       */

      if (attendance.currentStatus !== 'Working') {
        return NextResponse.json(
          {
            success: false,
            message: 'You cannot start a break right now.',
          },
          {
            status: 400,
          }
        );
      }

      const now = new Date();

      /*
       * Create break log
       */

      await AttendanceLog.create({
        employee: user._id,

        attendance: attendance._id,

        dateTime: now,

        type: 'BREAK_IN',

        source: 'Web',

        createdBy: user._id,
      });

      /*
       * Update attendance
       */

      attendance.currentStatus = 'On Break';

      attendance.lastActivityAt = now;

      attendance.updatedBy = user._id;

      await attendance.save();

      return NextResponse.json({
        success: true,

        message: 'Break started successfully.',

        data: attendance,
      });
    }

    /*
     * BREAK OUT
     */

    if (type === 'BREAK_OUT') {
      /*
       * Must currently be on break
       */

      if (attendance.currentStatus !== 'On Break') {
        return NextResponse.json(
          {
            success: false,
            message: 'You are not currently on break.',
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Find latest BREAK_IN
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
          {
            status: 400,
          }
        );
      }

      const now = new Date();

      /*
       * Calculate break duration
       */

      const breakMilliseconds =
        now.getTime() - breakIn.dateTime.getTime();

      const breakMinutes = Math.max(
        0,
        Math.floor(breakMilliseconds / 60000)
      );

      /*
       * Create BREAK_OUT log
       */

      await AttendanceLog.create({
        employee: user._id,

        attendance: attendance._id,

        dateTime: now,

        type: 'BREAK_OUT',

        source: 'Web',

        createdBy: user._id,
      });

      /*
       * Update attendance
       */

      attendance.currentStatus = 'Working';

      attendance.lastActivityAt = now;

      attendance.breakMinutes =
        (attendance.breakMinutes || 0) + breakMinutes;

      attendance.updatedBy = user._id;

      await attendance.save();

      return NextResponse.json({
        success: true,

        message: 'Break ended successfully.',

        data: attendance,

        breakMinutes,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid request.',
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error('Attendance Break API Error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to update break.';

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