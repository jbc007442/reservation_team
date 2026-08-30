import dayjs from 'dayjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';

import Attendance from '@/models/attendance/Attendance';
import AttendanceLog from '@/models/attendance/AttendanceLog';
import User from '@/models/user/User';

type SessionName = 'am' | 'pm';

interface SessionCalculation {
  checkIn: Date | null;
  checkOut: Date | null;
  workingMinutes: number;
  breakMinutes: number;
  currentStatus: 'Working' | 'On Break' | 'Checked Out';
  lastActivityAt: Date | null;
  autoLogoutAt: Date | null;
}

/*
|--------------------------------------------------------------------------
| Calculate AM / PM from logs
|--------------------------------------------------------------------------
*/

function calculateSession(
  logs: any[],
  sessionName: SessionName,
  storedSession: any,
  now: Date
): SessionCalculation {
  const sessionLogs = logs
    .filter((log) => {
      const logDate = new Date(log.dateTime);

      const logSession: SessionName = logDate.getHours() < 12 ? 'am' : 'pm';

      return logSession === sessionName;
    })
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  /*
  |--------------------------------------------------------------------------
  | Find all IN / OUT sessions
  |--------------------------------------------------------------------------
  */

  let totalWorkingMinutes = 0;

  let totalBreakMinutes = 0;

  let activeLogin: Date | null = null;

  let activeBreak: Date | null = null;

  let firstCheckIn: Date | null = null;

  let lastCheckOut: Date | null = null;

  let lastActivityAt: Date | null = null;

  for (const log of sessionLogs) {
    const logTime = new Date(log.dateTime);

    lastActivityAt = logTime;

    /*
    |--------------------------------------------------------------------------
    | LOGIN
    |--------------------------------------------------------------------------
    */

    if (log.type === 'IN') {
      /*
       * Only start a new login if there isn't
       * already an active login.
       */

      if (!activeLogin) {
        activeLogin = logTime;

        if (!firstCheckIn) {
          firstCheckIn = logTime;
        }
      }
    } else if (log.type === 'BREAK_IN') {

    /*
    |--------------------------------------------------------------------------
    | BREAK IN
    |--------------------------------------------------------------------------
    */
      if (activeLogin && !activeBreak) {
        activeBreak = logTime;
      }
    } else if (log.type === 'BREAK_OUT') {

    /*
    |--------------------------------------------------------------------------
    | BREAK OUT
    |--------------------------------------------------------------------------
    */
      if (activeBreak) {
        const breakMinutes = Math.max(
          0,
          Math.floor((logTime.getTime() - activeBreak.getTime()) / 60000)
        );

        totalBreakMinutes += breakMinutes;

        activeBreak = null;
      }
    } else if (log.type === 'OUT') {

    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */
      if (activeLogin) {
        const sessionEnd = logTime;

        const totalMinutes = Math.max(
          0,
          Math.floor((sessionEnd.getTime() - activeLogin.getTime()) / 60000)
        );

        /*
        |--------------------------------------------------------------------------
        | If break is still open when logout happens
        |--------------------------------------------------------------------------
        */

        if (activeBreak) {
          const breakMinutes = Math.max(
            0,
            Math.floor((sessionEnd.getTime() - activeBreak.getTime()) / 60000)
          );

          totalBreakMinutes += breakMinutes;

          activeBreak = null;
        }

        /*
        |--------------------------------------------------------------------------
        | Working = total session time - breaks
        |--------------------------------------------------------------------------
        */

        const sessionBreakMinutes = totalBreakMinutes;

        totalWorkingMinutes = Math.max(0, totalMinutes - sessionBreakMinutes);

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        | The above is cumulative for the session.
        | For multiple login/logout cycles we need to
        | accumulate each interval independently.
        |--------------------------------------------------------------------------
        */

        activeLogin = null;

        lastCheckOut = sessionEnd;
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Recalculate correctly for multiple login/logout cycles
  |--------------------------------------------------------------------------
  */

  totalWorkingMinutes = 0;
  totalBreakMinutes = 0;

  activeLogin = null;
  activeBreak = null;

  let currentCheckIn: Date | null = null;

  for (const log of sessionLogs) {
    const logTime = new Date(log.dateTime);

    /*
    |--------------------------------------------------------------------------
    | IN
    |--------------------------------------------------------------------------
    */

    if (log.type === 'IN') {
      if (!activeLogin) {
        activeLogin = logTime;

        if (!firstCheckIn) {
          firstCheckIn = logTime;
        }
      }

      continue;
    }

    /*
    |--------------------------------------------------------------------------
    | BREAK IN
    |--------------------------------------------------------------------------
    */

    if (log.type === 'BREAK_IN') {
      if (activeLogin && !activeBreak) {
        activeBreak = logTime;
      }

      continue;
    }

    /*
    |--------------------------------------------------------------------------
    | BREAK OUT
    |--------------------------------------------------------------------------
    */

    if (log.type === 'BREAK_OUT') {
      if (activeBreak) {
        totalBreakMinutes += Math.max(
          0,
          Math.floor((logTime.getTime() - activeBreak.getTime()) / 60000)
        );

        activeBreak = null;
      }

      continue;
    }

    /*
    |--------------------------------------------------------------------------
    | OUT
    |--------------------------------------------------------------------------
    */

    if (log.type === 'OUT') {
      if (activeLogin) {
        /*
        |--------------------------------------------------------------------------
        | Close active break at logout if necessary
        |--------------------------------------------------------------------------
        */

        if (activeBreak) {
          totalBreakMinutes += Math.max(
            0,
            Math.floor((logTime.getTime() - activeBreak.getTime()) / 60000)
          );

          activeBreak = null;
        }

        /*
        |--------------------------------------------------------------------------
        | Calculate this login interval
        |--------------------------------------------------------------------------
        */

        const loginMinutes = Math.max(
          0,
          Math.floor((logTime.getTime() - activeLogin.getTime()) / 60000)
        );

        /*
        |--------------------------------------------------------------------------
        | Calculate breaks belonging to this interval
        |--------------------------------------------------------------------------
        |
        | We need to avoid subtracting breaks from previous
        | login intervals.
        |
        */

        let intervalBreakMinutes = 0;

        let intervalBreakIn: Date | null = null;

        for (const intervalLog of sessionLogs) {
          const intervalTime = new Date(intervalLog.dateTime);

          if (intervalTime < activeLogin || intervalTime > logTime) {
            continue;
          }

          if (intervalLog.type === 'BREAK_IN') {
            intervalBreakIn = intervalTime;
          }

          if (intervalLog.type === 'BREAK_OUT' && intervalBreakIn) {
            intervalBreakMinutes += Math.max(
              0,
              Math.floor((intervalTime.getTime() - intervalBreakIn.getTime()) / 60000)
            );

            intervalBreakIn = null;
          }
        }

        /*
        |--------------------------------------------------------------------------
        | Add this login interval
        |--------------------------------------------------------------------------
        */

        totalWorkingMinutes += Math.max(0, loginMinutes - intervalBreakMinutes);

        activeLogin = null;

        lastCheckOut = logTime;
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Currently Working Session
  |--------------------------------------------------------------------------
  */

  if (activeLogin) {
    currentCheckIn = activeLogin;

    const sessionEnd = now;

    let intervalBreakMinutes = 0;

    let intervalBreakIn: Date | null = null;

    for (const log of sessionLogs) {
      const logTime = new Date(log.dateTime);

      if (logTime < activeLogin || logTime > sessionEnd) {
        continue;
      }

      if (log.type === 'BREAK_IN') {
        intervalBreakIn = logTime;
      }

      if (log.type === 'BREAK_OUT' && intervalBreakIn) {
        intervalBreakMinutes += Math.max(
          0,
          Math.floor((logTime.getTime() - intervalBreakIn.getTime()) / 60000)
        );

        intervalBreakIn = null;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Active Break
    |--------------------------------------------------------------------------
    */

    if (activeBreak) {
      intervalBreakMinutes += Math.max(
        0,
        Math.floor((sessionEnd.getTime() - activeBreak.getTime()) / 60000)
      );

      totalBreakMinutes += Math.max(
        0,
        Math.floor((sessionEnd.getTime() - activeBreak.getTime()) / 60000)
      );
    }

    const currentWorkingMinutes = Math.max(
      0,
      Math.floor((sessionEnd.getTime() - activeLogin.getTime()) / 60000) - intervalBreakMinutes
    );

    totalWorkingMinutes += currentWorkingMinutes;
  }

  /*
  |--------------------------------------------------------------------------
  | Current Status
  |--------------------------------------------------------------------------
  */

  let currentStatus: SessionCalculation['currentStatus'] = 'Checked Out';

  if (activeLogin) {
    currentStatus = activeBreak ? 'On Break' : 'Working';
  }

  /*
  |--------------------------------------------------------------------------
  | Last Activity
  |--------------------------------------------------------------------------
  */

  if (!lastActivityAt && storedSession?.lastActivityAt) {
    lastActivityAt = new Date(storedSession.lastActivityAt);
  }

  /*
  |--------------------------------------------------------------------------
  | Auto Logout
  |--------------------------------------------------------------------------
  */

  const autoLogoutAt =
    activeLogin && storedSession?.autoLogoutAt ? new Date(storedSession.autoLogoutAt) : null;

  /*
  |--------------------------------------------------------------------------
  | Return Session
  |--------------------------------------------------------------------------
  */

  return {
    checkIn: firstCheckIn,
    checkOut: lastCheckOut,

    currentStatus,

    lastActivityAt,

    workingMinutes: totalWorkingMinutes,

    breakMinutes: totalBreakMinutes,

    autoLogoutAt,
  };
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    const cookieStore = await cookies();

    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized.',
        },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    const admin = await User.findById(payload.userId).select('_id name email role status').lean();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found.',
        },
        { status: 401 }
      );
    }

    if (admin.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          message: 'Access denied.',
        },
        { status: 403 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Query Parameters
    |--------------------------------------------------------------------------
    */

    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.trim() || '';

    const status = searchParams.get('status') || '';

    const date = searchParams.get('date') || '';

    /*
    |--------------------------------------------------------------------------
    | Date Range
    |--------------------------------------------------------------------------
    */

    const selectedDate = date ? new Date(date) : new Date();

    const startDate = new Date(selectedDate);

    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(selectedDate);

    endDate.setHours(23, 59, 59, 999);

    /*
    |--------------------------------------------------------------------------
    | Employee Search
    |--------------------------------------------------------------------------
    */

    let employeeIds: string[] = [];

    if (search) {
      const employees = await User.find({
        role: {
          $ne: 'admin',
        },

        $or: [
          {
            name: {
              $regex: search,
              $options: 'i',
            },
          },

          {
            employeeId: {
              $regex: search,
              $options: 'i',
            },
          },

          {
            email: {
              $regex: search,
              $options: 'i',
            },
          },
        ],
      })
        .select('_id')
        .lean();

      employeeIds = employees.map((item) => item._id.toString());

      if (employeeIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          total: 0,
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Attendance Filter
    |--------------------------------------------------------------------------
    */

    const filter: Record<string, unknown> = {
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    /*
    |--------------------------------------------------------------------------
    | Status Filter
    |--------------------------------------------------------------------------
    */

    if (status && status !== 'All') {
      filter.$or = [
        {
          'am.currentStatus': status,
        },

        {
          'pm.currentStatus': status,
        },

        {
          status: status,
        },
      ];
    }

    /*
    |--------------------------------------------------------------------------
    | Employee Filter
    |--------------------------------------------------------------------------
    */

    if (employeeIds.length > 0) {
      filter.employee = {
        $in: employeeIds,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Attendance
    |--------------------------------------------------------------------------
    */

    const attendance = await Attendance.find(filter)
      .populate({
        path: 'employee',
        select: '_id employeeId name email department designation avatar',
      })
      .sort({
        date: -1,
      })
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Fetch Logs
    |--------------------------------------------------------------------------
    */

    const attendanceIds = attendance.map((item) => item._id);

    const logs = await AttendanceLog.find({
      attendance: {
        $in: attendanceIds,
      },

      dateTime: {
        $gte: startDate,
        $lte: endDate,
      },

      type: {
        $in: ['IN', 'OUT', 'BREAK_IN', 'BREAK_OUT'],
      },
    })
      .sort({
        dateTime: 1,
      })
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Group Logs By Attendance
    |--------------------------------------------------------------------------
    */

    const logsByAttendance = new Map<string, any[]>();

    for (const log of logs) {
      const attendanceId = log.attendance.toString();

      if (!logsByAttendance.has(attendanceId)) {
        logsByAttendance.set(attendanceId, []);
      }

      logsByAttendance.get(attendanceId)!.push(log);
    }

    /*
    |--------------------------------------------------------------------------
    | Format Response
    |--------------------------------------------------------------------------
    */

    const now = new Date();

    const data = attendance.map((item: any) => {
      const itemLogs = logsByAttendance.get(item._id.toString()) || [];

      /*
      |--------------------------------------------------------------------------
      | Calculate AM
      |--------------------------------------------------------------------------
      */

      const am = calculateSession(itemLogs, 'am', item.am, now);

      /*
      |--------------------------------------------------------------------------
      | Calculate PM
      |--------------------------------------------------------------------------
      */

      const pm = calculateSession(itemLogs, 'pm', item.pm, now);

      /*
      |--------------------------------------------------------------------------
      | Overall Totals
      |--------------------------------------------------------------------------
      */

      const workingMinutes = am.workingMinutes + pm.workingMinutes;

      const breakMinutes = am.breakMinutes + pm.breakMinutes;

      /*
      |--------------------------------------------------------------------------
      | Overall Status
      |--------------------------------------------------------------------------
      */

      let currentStatus = 'Checked Out';

      if (am.currentStatus === 'On Break' || pm.currentStatus === 'On Break') {
        currentStatus = 'On Break';
      } else if (am.currentStatus === 'Working' || pm.currentStatus === 'Working') {
        currentStatus = 'Working';
      }

      return {
        _id: item._id,

        employee: item.employee,

        date: item.date,

        /*
        |--------------------------------------------------------------------------
        | AM
        |--------------------------------------------------------------------------
        */

        am: {
          ...am,

          checkIn: am.checkIn ? am.checkIn.toISOString() : null,

          checkOut: am.checkOut ? am.checkOut.toISOString() : null,

          lastActivityAt: am.lastActivityAt ? am.lastActivityAt.toISOString() : null,

          autoLogoutAt: am.autoLogoutAt ? am.autoLogoutAt.toISOString() : null,
        },

        /*
        |--------------------------------------------------------------------------
        | PM
        |--------------------------------------------------------------------------
        */

        pm: {
          ...pm,

          checkIn: pm.checkIn ? pm.checkIn.toISOString() : null,

          checkOut: pm.checkOut ? pm.checkOut.toISOString() : null,

          lastActivityAt: pm.lastActivityAt ? pm.lastActivityAt.toISOString() : null,

          autoLogoutAt: pm.autoLogoutAt ? pm.autoLogoutAt.toISOString() : null,
        },

        /*
        |--------------------------------------------------------------------------
        | Overall
        |--------------------------------------------------------------------------
        */

        currentStatus,

        workingMinutes,

        breakMinutes,

        status: item.status,

        createdAt: item.createdAt,

        updatedAt: item.updatedAt,
      };
    });

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,

      data,

      total: data.length,

      date: startDate,
    });
  } catch (error) {
    console.error('Daily Attendance GET API Error:', error);

    return NextResponse.json(
      {
        success: false,

        message: error instanceof Error ? error.message : 'Failed to fetch daily attendance.',
      },
      {
        status: 500,
      }
    );
  }
}
