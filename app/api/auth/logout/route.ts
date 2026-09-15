import dayjs from 'dayjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';

import Attendance from '@/models/attendance/Attendance';
import AttendanceLog from '@/models/attendance/AttendanceLog';
import Roster from '@/models/attendance/Roster';
import User from '@/models/user/User';

type AttendanceStatus = 'P' | 'WO' | 'L' | 'H' | 'HD' | 'A' | 'OD' | 'WFH' | 'SL';

const PROTECTED_ROSTER_STATUSES: AttendanceStatus[] = ['WO', 'L', 'H', 'OD', 'WFH'];

/*
|--------------------------------------------------------------------------
| Calculate Attendance Status
|--------------------------------------------------------------------------
|
| < 5 hours       = SL
| 5 to < 7 hours  = HD
| 7+ hours        = P
|
*/

function calculateAttendanceStatus(workingMinutes: number, hasCheckIn: boolean): AttendanceStatus {
  if (!hasCheckIn) {
    return 'A';
  }

  if (workingMinutes < 300) {
    return 'SL';
  }

  if (workingMinutes < 420) {
    return 'HD';
  }

  return 'P';
}

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

      /*
      |--------------------------------------------------------------------------
      | Find Today's Roster
      |--------------------------------------------------------------------------
      */

      const roster = await Roster.findOne({
        employee: user._id,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        rosterStatus: 'active',
      });

      /*
      |--------------------------------------------------------------------------
      | Find Active Session
      |--------------------------------------------------------------------------
      */

      if (attendance) {
        let sessionName: 'am' | 'pm' | null = null;

        /*
        |--------------------------------------------------------------------------
        | Check PM First
        |--------------------------------------------------------------------------
        */

        if (
          attendance.pm &&
          (attendance.pm.currentStatus === 'Working' || attendance.pm.currentStatus === 'On Break')
        ) {
          sessionName = 'pm';
        } else if (

        /*
        |--------------------------------------------------------------------------
        | Otherwise Check AM
        |--------------------------------------------------------------------------
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
          | Effective Checkout Time
          |--------------------------------------------------------------------------
          |
          | If autoLogoutAt exists and has already passed,
          | don't count time beyond autoLogoutAt.
          |
          */

          let effectiveCheckoutTime = now;

          if (
            session.autoLogoutAt &&
            session.autoLogoutAt.getTime() < effectiveCheckoutTime.getTime()
          ) {
            effectiveCheckoutTime = session.autoLogoutAt;
          }

          /*
          |--------------------------------------------------------------------------
          | Calculate Current Login Duration
          |--------------------------------------------------------------------------
          */

          let currentSessionMinutes = 0;

          if (session.checkIn) {
            currentSessionMinutes = Math.max(
              0,
              Math.floor((effectiveCheckoutTime.getTime() - session.checkIn.getTime()) / 60000)
            );
          }

          /*
          |--------------------------------------------------------------------------
          | Current Session Break
          |--------------------------------------------------------------------------
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
          | Add Current Session To Existing Total
          |--------------------------------------------------------------------------
          */

          const previousWorkingMinutes = Number(session.workingMinutes || 0);

          session.workingMinutes = previousWorkingMinutes + currentWorkingMinutes;

          /*
          |--------------------------------------------------------------------------
          | Checkout
          |--------------------------------------------------------------------------
          */

          session.checkOut = effectiveCheckoutTime;

          session.currentStatus = 'Checked Out';

          session.lastActivityAt = effectiveCheckoutTime;

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

          attendance.lastActivityAt = effectiveCheckoutTime;

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
          | Save Attendance
          |--------------------------------------------------------------------------
          */

          await attendance.save();

          /*
          |--------------------------------------------------------------------------
          | Create OUT Log
          |--------------------------------------------------------------------------
          */

          await AttendanceLog.create({
            employee: user._id,

            attendance: attendance._id,

            dateTime: effectiveCheckoutTime,

            type: 'OUT',

            source: 'Web',

            remarks: `${sessionName.toUpperCase()} session checked out`,

            createdBy: user._id,
          });
        }

        /*
        |--------------------------------------------------------------------------
        | Update Roster Status
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        |
        | Special admin statuses are protected:
        |
        | WO / L / H / OD / WFH
        |
        | Everything else is calculated from actual working time.
        |
        */

        if (roster) {
          const currentRosterStatus = roster.status as AttendanceStatus;

          /*
          |--------------------------------------------------------------------------
          | Protected Status
          |--------------------------------------------------------------------------
          */

          if (PROTECTED_ROSTER_STATUSES.includes(currentRosterStatus)) {
            console.log(`Roster status ${currentRosterStatus} protected for employee ${user._id}`);
          } else {

          /*
          |--------------------------------------------------------------------------
          | Calculate Actual Attendance Status
          |--------------------------------------------------------------------------
          */
            const totalWorkingMinutes = Number(attendance.workingMinutes || 0);

            const hasCheckIn = Boolean(attendance.am?.checkIn) || Boolean(attendance.pm?.checkIn);

            const calculatedStatus = calculateAttendanceStatus(totalWorkingMinutes, hasCheckIn);

            roster.status = calculatedStatus;

            roster.updatedBy = user._id;

            await roster.save();

            console.log(`Roster status updated: ${currentRosterStatus} -> ${calculatedStatus}`, {
              employee: user._id.toString(),
              workingMinutes: totalWorkingMinutes,
            });
          }
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
