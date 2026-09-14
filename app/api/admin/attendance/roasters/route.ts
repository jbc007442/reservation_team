import { NextRequest, NextResponse } from 'next/server';
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
| Date Helpers
|--------------------------------------------------------------------------
*/

function createLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);

  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
}

/*
|--------------------------------------------------------------------------
| Safe Date Helper
|--------------------------------------------------------------------------
*/

function toValidDate(value: any): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/*
|--------------------------------------------------------------------------
| Calculate Minutes
|--------------------------------------------------------------------------
*/

function calculateMinutes(from: Date, to: Date): number {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 60000));
}

/*
|--------------------------------------------------------------------------
| Calculate AM / PM Session
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| calculationEnd is the maximum time that this session is allowed
| to calculate up to.
|
| For today:
|     calculationEnd = current time
|
| For previous dates:
|     calculationEnd = 23:59:59 of that date
|
|--------------------------------------------------------------------------
*/

function calculateSession(
  logs: any[],
  sessionName: SessionName,
  storedSession: any,
  calculationEnd: Date
): SessionCalculation {
  /*
  |--------------------------------------------------------------------------
  | Filter Session Logs
  |--------------------------------------------------------------------------
  */

  const sessionLogs = logs
    .filter((log) => {
      const logDate = toValidDate(log.dateTime);

      if (!logDate) {
        return false;
      }

      const logSession: SessionName = logDate.getHours() < 12 ? 'am' : 'pm';

      return logSession === sessionName;
    })
    .sort((a, b) => {
      const aDate = toValidDate(a.dateTime)?.getTime() || 0;

      const bDate = toValidDate(b.dateTime)?.getTime() || 0;

      return aDate - bDate;
    });

  /*
  |--------------------------------------------------------------------------
  | Variables
  |--------------------------------------------------------------------------
  */

  let totalWorkingMinutes = 0;
  let totalBreakMinutes = 0;

  let activeLogin: Date | null = null;
  let activeBreak: Date | null = null;

  let firstCheckIn: Date | null = null;
  let lastCheckOut: Date | null = null;
  let lastActivityAt: Date | null = null;

  /*
  |--------------------------------------------------------------------------
  | Process Logs
  |--------------------------------------------------------------------------
  */

  for (const log of sessionLogs) {
    const logTime = toValidDate(log.dateTime);

    if (!logTime) {
      continue;
    }

    /*
    |--------------------------------------------------------------------------
    | Never process logs after calculationEnd
    |--------------------------------------------------------------------------
    */

    if (logTime > calculationEnd) {
      continue;
    }

    lastActivityAt = logTime;

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
        const breakMinutes = calculateMinutes(activeBreak, logTime);

        totalBreakMinutes += breakMinutes;

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
        | Close Active Break
        |--------------------------------------------------------------------------
        */

        if (activeBreak) {
          const breakMinutes = calculateMinutes(activeBreak, logTime);

          totalBreakMinutes += breakMinutes;

          activeBreak = null;
        }

        /*
        |--------------------------------------------------------------------------
        | Login Duration
        |--------------------------------------------------------------------------
        */

        const loginMinutes = calculateMinutes(activeLogin, logTime);

        /*
        |--------------------------------------------------------------------------
        | Breaks Inside This Login
        |--------------------------------------------------------------------------
        */

        let intervalBreakMinutes = 0;

        let intervalBreakIn: Date | null = null;

        for (const intervalLog of sessionLogs) {
          const intervalTime = toValidDate(intervalLog.dateTime);

          if (!intervalTime) {
            continue;
          }

          if (
            intervalTime < activeLogin ||
            intervalTime > logTime ||
            intervalTime > calculationEnd
          ) {
            continue;
          }

          if (intervalLog.type === 'BREAK_IN') {
            intervalBreakIn = intervalTime;
          }

          if (intervalLog.type === 'BREAK_OUT' && intervalBreakIn) {
            intervalBreakMinutes += calculateMinutes(intervalBreakIn, intervalTime);

            intervalBreakIn = null;
          }
        }

        /*
        |--------------------------------------------------------------------------
        | Add Working Time
        |--------------------------------------------------------------------------
        */

        totalWorkingMinutes += Math.max(0, loginMinutes - intervalBreakMinutes);

        activeLogin = null;

        lastCheckOut = logTime;
      }

      continue;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FALLBACK TO STORED SESSION
  |--------------------------------------------------------------------------
  |
  | If the Attendance document has a checkIn but its AttendanceLog
  | is missing, use the stored session.
  |
  |--------------------------------------------------------------------------
  */

  if (!activeLogin && !firstCheckIn) {
    const storedCheckIn = toValidDate(storedSession?.checkIn);

    const storedCheckOut = toValidDate(storedSession?.checkOut);

    if (storedCheckIn) {
      /*
      |--------------------------------------------------------------------------
      | Do not use a check-in from the future
      |--------------------------------------------------------------------------
      */

      if (storedCheckIn <= calculationEnd) {
        firstCheckIn = storedCheckIn;

        /*
        |--------------------------------------------------------------------------
        | Already Checked Out
        |--------------------------------------------------------------------------
        */

        if (storedCheckOut && storedCheckOut >= storedCheckIn && storedCheckOut <= calculationEnd) {
          const loginMinutes = calculateMinutes(storedCheckIn, storedCheckOut);

          totalWorkingMinutes += loginMinutes;

          lastCheckOut = storedCheckOut;

          lastActivityAt = lastActivityAt || storedCheckOut;
        } else if (!storedCheckOut) {

        /*
        |--------------------------------------------------------------------------
        | Still Active
        |--------------------------------------------------------------------------
        */
          activeLogin = storedCheckIn;

          lastActivityAt = lastActivityAt || storedCheckIn;
        }
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Currently Working
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | We calculate only until calculationEnd.
  |
  | Therefore:
  |
  | 13 Sep → maximum 13 Sep 23:59:59
  | 14 Sep → maximum current time
  |
  |--------------------------------------------------------------------------
  */

  if (activeLogin) {
    let intervalBreakMinutes = 0;

    let intervalBreakIn: Date | null = null;

    /*
    |--------------------------------------------------------------------------
    | Completed Breaks
    |--------------------------------------------------------------------------
    */

    for (const log of sessionLogs) {
      const logTime = toValidDate(log.dateTime);

      if (!logTime) {
        continue;
      }

      if (logTime < activeLogin || logTime > calculationEnd) {
        continue;
      }

      if (log.type === 'BREAK_IN') {
        intervalBreakIn = logTime;
      }

      if (log.type === 'BREAK_OUT' && intervalBreakIn) {
        intervalBreakMinutes += calculateMinutes(intervalBreakIn, logTime);

        intervalBreakIn = null;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Active Break
    |--------------------------------------------------------------------------
    */

    if (activeBreak) {
      intervalBreakMinutes += calculateMinutes(activeBreak, calculationEnd);
    }

    /*
    |--------------------------------------------------------------------------
    | Current Working Minutes
    |--------------------------------------------------------------------------
    */

    const currentWorkingMinutes = Math.max(
      0,
      calculateMinutes(activeLogin, calculationEnd) - intervalBreakMinutes
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

  if (!lastActivityAt) {
    const storedLastActivity = toValidDate(storedSession?.lastActivityAt);

    if (storedLastActivity) {
      lastActivityAt = storedLastActivity;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Auto Logout
  |--------------------------------------------------------------------------
  */

  const storedAutoLogout = toValidDate(storedSession?.autoLogoutAt);

  const autoLogoutAt = activeLogin && storedAutoLogout ? storedAutoLogout : null;

  /*
  |--------------------------------------------------------------------------
  | Return
  |--------------------------------------------------------------------------
  */

  return {
    checkIn: firstCheckIn,

    checkOut: lastCheckOut,

    workingMinutes: totalWorkingMinutes,

    breakMinutes: totalBreakMinutes,

    currentStatus,

    lastActivityAt,

    autoLogoutAt,
  };
}

/*
|--------------------------------------------------------------------------
| Calculate Attendance Status
|--------------------------------------------------------------------------
|
| Rules:
|
| < 5 hours
|     => Short Login
|
| 5 hours to < 7 hours
|     => Half Day
|
| >= 7 hours
|     => Present
|
|--------------------------------------------------------------------------
*/

function calculateAttendanceStatus(
  workingMinutes: number,
  hasCheckIn: boolean,
  existingStatus?: string
): string {
  /*
  |--------------------------------------------------------------------------
  | Actual Login Exists
  |--------------------------------------------------------------------------
  |
  | Working time is the source of truth.
  |
  |--------------------------------------------------------------------------
  */

  if (hasCheckIn) {
    /*
    |--------------------------------------------------------------------------
    | Less Than 5 Hours
    |--------------------------------------------------------------------------
    */

    if (workingMinutes < 300) {
      return 'Short Login';
    }

    /*
    |--------------------------------------------------------------------------
    | 5 Hours To Less Than 7 Hours
    |--------------------------------------------------------------------------
    */

    if (workingMinutes < 420) {
      return 'Half Day';
    }

    /*
    |--------------------------------------------------------------------------
    | 7 Hours Or More
    |--------------------------------------------------------------------------
    */

    return 'Present';
  }

  /*
  |--------------------------------------------------------------------------
  | No Check-In
  |--------------------------------------------------------------------------
  |
  | Preserve only manual attendance statuses.
  |
  |--------------------------------------------------------------------------
  */

  const manualStatuses = ['Absent', 'Leave', 'Holiday', 'Weekly Off'];

  if (existingStatus && manualStatuses.includes(existingStatus)) {
    return existingStatus;
  }

  return 'Not Marked';
}

/*
|--------------------------------------------------------------------------
| GET ROSTER
|--------------------------------------------------------------------------
*/

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const from = searchParams.get('from');

    const to = searchParams.get('to');

    const search = searchParams.get('search')?.trim() || '';

    /*
    |--------------------------------------------------------------------------
    | Date Range
    |--------------------------------------------------------------------------
    */

    const today = new Date();

    const startDate = from
      ? createLocalDate(from)
      : new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);

    const endDate = to ? createLocalDate(to) : new Date(startDate);

    endDate.setHours(23, 59, 59, 999);

    /*
    |--------------------------------------------------------------------------
    | Employee Filter
    |--------------------------------------------------------------------------
    */

    const userFilter: Record<string, any> = {
      role: {
        $ne: 'admin',
      },
    };

    if (search) {
      userFilter.$or = [
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
      ];
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Users
    |--------------------------------------------------------------------------
    */

    const users = await User.find(userFilter)
      .select('_id employeeId name email department designation avatar')
      .sort({
        name: 1,
      })
      .lean();

    /*
    |--------------------------------------------------------------------------
    | No Users
    |--------------------------------------------------------------------------
    */

    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        dates: [],
        from: startDate,
        to: endDate,
      });
    }

    const employeeIds = users.map((user: any) => user._id);

    /*
    |--------------------------------------------------------------------------
    | Fetch Attendance
    |--------------------------------------------------------------------------
    */

    const attendance = await Attendance.find({
      employee: {
        $in: employeeIds,
      },

      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({
        date: 1,
      })
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Fetch Attendance Logs
    |--------------------------------------------------------------------------
    */

    const attendanceIds = attendance.map((item: any) => item._id);

    const logs =
      attendanceIds.length > 0
        ? await AttendanceLog.find({
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
            .lean()
        : [];

    /*
    |--------------------------------------------------------------------------
    | Attendance Map
    |--------------------------------------------------------------------------
    */

    const attendanceMap = new Map<string, any>();

    for (const item of attendance as any[]) {
      if (!item.employee) {
        continue;
      }

      const employeeId = item.employee.toString();

      const attendanceDate = new Date(item.date);

      const dateKey = formatLocalDate(attendanceDate);

      const mapKey = `${employeeId}_${dateKey}`;

      attendanceMap.set(mapKey, item);
    }

    /*
    |--------------------------------------------------------------------------
    | Logs By Attendance
    |--------------------------------------------------------------------------
    */

    const logsByAttendance = new Map<string, any[]>();

    for (const log of logs as any[]) {
      if (!log.attendance) {
        continue;
      }

      const attendanceId = log.attendance.toString();

      if (!logsByAttendance.has(attendanceId)) {
        logsByAttendance.set(attendanceId, []);
      }

      logsByAttendance.get(attendanceId)!.push(log);
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Date List
    |--------------------------------------------------------------------------
    */

    const dates: string[] = [];

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(formatLocalDate(currentDate));

      currentDate = addDays(currentDate, 1);
    }

    /*
    |--------------------------------------------------------------------------
    | Current Time
    |--------------------------------------------------------------------------
    */

    const now = new Date();

    /*
    |--------------------------------------------------------------------------
    | Build Roster
    |--------------------------------------------------------------------------
    */

    const data = users.map((user: any) => {
      const employeeAttendance: Record<string, any> = {};

      for (const dateKey of dates) {
        const mapKey = `${user._id.toString()}_${dateKey}`;

        const attendanceItem = attendanceMap.get(mapKey);

        /*
            |--------------------------------------------------------------------------
            | NO ATTENDANCE
            |--------------------------------------------------------------------------
            */

        if (!attendanceItem) {
          employeeAttendance[dateKey] = {
            status: 'Not Marked',

            currentStatus: 'Checked Out',

            workingMinutes: 0,

            breakMinutes: 0,

            am: null,

            pm: null,
          };

          continue;
        }

        /*
            |--------------------------------------------------------------------------
            | Attendance Logs
            |--------------------------------------------------------------------------
            */

        const itemLogs = logsByAttendance.get(attendanceItem._id.toString()) || [];

        /*
            |--------------------------------------------------------------------------
            | IMPORTANT:
            |
            | Determine the END of THIS attendance day.
            |--------------------------------------------------------------------------
            */

        const attendanceDate = createLocalDate(dateKey);

        const dayEnd = new Date(attendanceDate);

        dayEnd.setHours(23, 59, 59, 999);

        /*
            |--------------------------------------------------------------------------
            | TODAY vs PREVIOUS DATE
            |--------------------------------------------------------------------------
            |
            | Today:
            |     calculate until current time.
            |
            | Previous day:
            |     calculate only until that day's end.
            |
            |--------------------------------------------------------------------------
            */

        const isToday = formatLocalDate(now) === dateKey;

        const calculationEnd = isToday ? now : dayEnd;

        /*
            |--------------------------------------------------------------------------
            | AM
            |--------------------------------------------------------------------------
            */

        const am = calculateSession(itemLogs, 'am', attendanceItem.am, calculationEnd);

        /*
            |--------------------------------------------------------------------------
            | PM
            |--------------------------------------------------------------------------
            */

        const pm = calculateSession(itemLogs, 'pm', attendanceItem.pm, calculationEnd);

        /*
            |--------------------------------------------------------------------------
            | Working Minutes
            |--------------------------------------------------------------------------
            */

        const workingMinutes = am.workingMinutes + pm.workingMinutes;

        /*
            |--------------------------------------------------------------------------
            | Break Minutes
            |--------------------------------------------------------------------------
            */

        const breakMinutes = am.breakMinutes + pm.breakMinutes;

        /*
            |--------------------------------------------------------------------------
            | Current Status
            |--------------------------------------------------------------------------
            */

        let currentStatus = 'Checked Out';

        if (am.currentStatus === 'On Break' || pm.currentStatus === 'On Break') {
          currentStatus = 'On Break';
        } else if (am.currentStatus === 'Working' || pm.currentStatus === 'Working') {
          currentStatus = 'Working';
        }

        /*
            |--------------------------------------------------------------------------
            | Check-In
            |--------------------------------------------------------------------------
            */

        const hasCheckIn = Boolean(am.checkIn || pm.checkIn);

        /*
            |--------------------------------------------------------------------------
            | Attendance Status
            |--------------------------------------------------------------------------
            */

        const status = calculateAttendanceStatus(workingMinutes, hasCheckIn, attendanceItem.status);

        /*
            |--------------------------------------------------------------------------
            | Build Attendance Day
            |--------------------------------------------------------------------------
            */

        employeeAttendance[dateKey] = {
          status,

          currentStatus,

          workingMinutes,

          breakMinutes,

          am: {
            ...am,

            checkIn: am.checkIn ? am.checkIn.toISOString() : null,

            checkOut: am.checkOut ? am.checkOut.toISOString() : null,

            lastActivityAt: am.lastActivityAt ? am.lastActivityAt.toISOString() : null,

            autoLogoutAt: am.autoLogoutAt ? am.autoLogoutAt.toISOString() : null,
          },

          pm: {
            ...pm,

            checkIn: pm.checkIn ? pm.checkIn.toISOString() : null,

            checkOut: pm.checkOut ? pm.checkOut.toISOString() : null,

            lastActivityAt: pm.lastActivityAt ? pm.lastActivityAt.toISOString() : null,

            autoLogoutAt: pm.autoLogoutAt ? pm.autoLogoutAt.toISOString() : null,
          },
        };
      }

      /*
          |--------------------------------------------------------------------------
          | Employee
          |--------------------------------------------------------------------------
          */

      return {
        employee: {
          _id: user._id,

          employeeId: user.employeeId,

          name: user.name,

          email: user.email,

          department: user.department,

          designation: user.designation,

          avatar: user.avatar,
        },

        attendance: employeeAttendance,
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

      dates,

      from: startDate,

      to: endDate,
    });
  } catch (error) {
    console.error('Roster Attendance GET API Error:', error);

    return NextResponse.json(
      {
        success: false,

        message: error instanceof Error ? error.message : 'Failed to fetch roster attendance.',
      },
      {
        status: 500,
      }
    );
  }
}
