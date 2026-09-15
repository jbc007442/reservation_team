import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

import Attendance from '@/models/attendance/Attendance';
import AttendanceLog from '@/models/attendance/AttendanceLog';
import Roster from '@/models/attendance/Roster';
import User from '@/models/user/User';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type SessionName = 'am' | 'pm';

type AttendanceStatus = 'P' | 'WO' | 'L' | 'H' | 'HD' | 'A' | 'OD' | 'WFH' | 'SL';

type SessionCurrentStatus = 'Working' | 'On Break' | 'Checked Out';

interface SessionCalculation {
  checkIn: Date | null;
  checkOut: Date | null;
  workingMinutes: number;
  breakMinutes: number;
  currentStatus: SessionCurrentStatus;
  lastActivityAt: Date | null;
  autoLogoutAt: Date | null;
}

/*
|--------------------------------------------------------------------------
| Status Rules
|--------------------------------------------------------------------------
|
| These statuses are manually assigned by admin and must be protected.
|
| WO  = Weekly Off
| L   = Leave
| H   = Holiday
| OD  = On Duty
| WFH = Work From Home
|
| P / HD / SL are attendance-generated statuses.
|--------------------------------------------------------------------------
*/

const PROTECTED_ROSTER_STATUSES: AttendanceStatus[] = ['WO', 'L', 'H', 'OD', 'WFH'];

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

function toValidDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value as string | number | Date);

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
*/

function calculateSession(
  logs: any[],
  sessionName: SessionName,
  storedSession: any,
  calculationEnd: Date
): SessionCalculation {
  /*
  |--------------------------------------------------------------------------
  | Filter logs for this session
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
    | Ignore logs after calculation end
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
        | Close active break
        |--------------------------------------------------------------------------
        */

        if (activeBreak) {
          const breakMinutes = calculateMinutes(activeBreak, logTime);

          totalBreakMinutes += breakMinutes;

          activeBreak = null;
        }

        /*
        |--------------------------------------------------------------------------
        | Login duration
        |--------------------------------------------------------------------------
        */

        const loginMinutes = calculateMinutes(activeLogin, logTime);

        /*
        |--------------------------------------------------------------------------
        | Calculate breaks inside this login
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
        | Add working time
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
  | Fallback to stored session
  |--------------------------------------------------------------------------
  */

  if (!activeLogin && !firstCheckIn) {
    const storedCheckIn = toValidDate(storedSession?.checkIn);

    const storedCheckOut = toValidDate(storedSession?.checkOut);

    if (storedCheckIn && storedCheckIn <= calculationEnd) {
      firstCheckIn = storedCheckIn;

      /*
      |--------------------------------------------------------------------------
      | Already checked out
      |--------------------------------------------------------------------------
      */

      if (storedCheckOut && storedCheckOut >= storedCheckIn && storedCheckOut <= calculationEnd) {
        const loginMinutes = calculateMinutes(storedCheckIn, storedCheckOut);

        const storedBreakMinutes = Number(storedSession?.breakMinutes || 0);

        totalBreakMinutes = storedBreakMinutes;

        totalWorkingMinutes = Math.max(0, loginMinutes - storedBreakMinutes);

        lastCheckOut = storedCheckOut;

        lastActivityAt = lastActivityAt || storedCheckOut;
      } else if (!storedCheckOut) {
        /*
        |--------------------------------------------------------------------------
        | Still active
        |--------------------------------------------------------------------------
        */

        activeLogin = storedCheckIn;

        lastActivityAt = lastActivityAt || storedCheckIn;
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Currently working
  |--------------------------------------------------------------------------
  */

  if (activeLogin) {
    let intervalBreakMinutes = 0;

    let intervalBreakIn: Date | null = null;

    /*
    |--------------------------------------------------------------------------
    | Completed breaks
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
    | Active break
    |--------------------------------------------------------------------------
    */

    if (activeBreak) {
      intervalBreakMinutes += calculateMinutes(activeBreak, calculationEnd);
    }

    /*
    |--------------------------------------------------------------------------
    | Current working minutes
    |--------------------------------------------------------------------------
    */

    const currentWorkingMinutes = Math.max(
      0,
      calculateMinutes(activeLogin, calculationEnd) - intervalBreakMinutes
    );

    totalWorkingMinutes += currentWorkingMinutes;

    /*
    |--------------------------------------------------------------------------
    | Break minutes
    |--------------------------------------------------------------------------
    */

    totalBreakMinutes += intervalBreakMinutes;
  }

  /*
  |--------------------------------------------------------------------------
  | Current Status
  |--------------------------------------------------------------------------
  */

  let currentStatus: SessionCurrentStatus = 'Checked Out';

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

    workingMinutes: Math.max(0, Math.floor(totalWorkingMinutes)),

    breakMinutes: Math.max(0, Math.floor(totalBreakMinutes)),

    currentStatus,

    lastActivityAt,

    autoLogoutAt,
  };
}

/*
|--------------------------------------------------------------------------
| Calculate Common Attendance Status
|--------------------------------------------------------------------------
|
| < 5 hours
|   => SL
|
| 5 hours to < 7 hours
|   => HD
|
| >= 7 hours
|   => P
|
| No login
|   => null
|--------------------------------------------------------------------------
*/

function calculateAttendanceStatus(
  workingMinutes: number,
  hasCheckIn: boolean
): AttendanceStatus | null {
  if (!hasCheckIn) {
    return null;
  }

  if (workingMinutes < 300) {
    return 'SL';
  }

  if (workingMinutes < 420) {
    return 'HD';
  }

  return 'P';
}

/*
|--------------------------------------------------------------------------
| GET ROSTER ATTENDANCE
|--------------------------------------------------------------------------
*/

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    /*
    |--------------------------------------------------------------------------
    | Query Parameters
    |--------------------------------------------------------------------------
    */

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
    | Validate Date Range
    |--------------------------------------------------------------------------
    */

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid date range.',
        },
        { status: 400 }
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        {
          success: false,
          message: 'from date cannot be greater than to date.',
        },
        { status: 400 }
      );
    }

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
    | Fetch Employees
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
    | No Employees
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
    | Fetch Roster
    |--------------------------------------------------------------------------
    |
    | New Roster model:
    |
    | status       = P / WO / L / H / HD / A / OD / WFH / SL
    |
    | rosterStatus = active / inactive
    |--------------------------------------------------------------------------
    */

    const rosterRecords = await Roster.find({
      employee: {
        $in: employeeIds,
      },

      date: {
        $gte: startDate,
        $lte: endDate,
      },

      rosterStatus: 'active',
    })
      .select('employee date status rosterStatus')
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Roster Map
    |--------------------------------------------------------------------------
    */

    const rosterMap = new Map<string, any>();

    for (const rosterItem of rosterRecords as any[]) {
      if (!rosterItem.employee) {
        continue;
      }

      const employeeId = rosterItem.employee.toString();

      const rosterDate = new Date(rosterItem.date);

      const dateKey = formatLocalDate(rosterDate);

      const mapKey = `${employeeId}_${dateKey}`;

      rosterMap.set(mapKey, rosterItem);
    }

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
    | Build Employee Attendance
    |--------------------------------------------------------------------------
    */

    const data = users.map((user: any) => {
      const employeeAttendance: Record<string, any> = {};

      for (const dateKey of dates) {
        const mapKey = `${user._id.toString()}_${dateKey}`;

        /*
          |--------------------------------------------------------------------------
          | Roster
          |--------------------------------------------------------------------------
          */

        const rosterItem = rosterMap.get(mapKey);

        const assignedStatus = (rosterItem?.status || null) as AttendanceStatus | null;

        /*
          |--------------------------------------------------------------------------
          | Attendance
          |--------------------------------------------------------------------------
          */

        const attendanceItem = attendanceMap.get(mapKey);

        /*
          |--------------------------------------------------------------------------
          | No Attendance
          |--------------------------------------------------------------------------
          |
          | If employee has not logged in yet:
          |
          | Admin assigned P  -> P
          | Admin assigned WO -> WO
          | Admin assigned L  -> L
          | etc.
          |
          | No roster -> A
          |--------------------------------------------------------------------------
          */

        if (!attendanceItem) {
          employeeAttendance[dateKey] = {
            status: assignedStatus || 'A',

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
          | Attendance Date
          |--------------------------------------------------------------------------
          */

        const attendanceDate = createLocalDate(dateKey);

        const dayEnd = new Date(attendanceDate);

        dayEnd.setHours(23, 59, 59, 999);

        /*
          |--------------------------------------------------------------------------
          | Today vs Previous Date
          |--------------------------------------------------------------------------
          */

        const isToday = formatLocalDate(now) === dateKey;

        const calculationEnd = isToday ? now : dayEnd;

        /*
          |--------------------------------------------------------------------------
          | Calculate AM
          |--------------------------------------------------------------------------
          */

        const am = calculateSession(itemLogs, 'am', attendanceItem.am, calculationEnd);

        /*
          |--------------------------------------------------------------------------
          | Calculate PM
          |--------------------------------------------------------------------------
          */

        const pm = calculateSession(itemLogs, 'pm', attendanceItem.pm, calculationEnd);

        /*
          |--------------------------------------------------------------------------
          | Total Working Minutes
          |--------------------------------------------------------------------------
          */

        const workingMinutes = am.workingMinutes + pm.workingMinutes;

        /*
          |--------------------------------------------------------------------------
          | Total Break Minutes
          |--------------------------------------------------------------------------
          */

        const breakMinutes = am.breakMinutes + pm.breakMinutes;

        /*
          |--------------------------------------------------------------------------
          | Current Login Status
          |--------------------------------------------------------------------------
          */

        let currentStatus: 'Working' | 'On Break' | 'Checked Out' = 'Checked Out';

        if (am.currentStatus === 'On Break' || pm.currentStatus === 'On Break') {
          currentStatus = 'On Break';
        } else if (am.currentStatus === 'Working' || pm.currentStatus === 'Working') {
          currentStatus = 'Working';
        }

        /*
          |--------------------------------------------------------------------------
          | Has Check-In
          |--------------------------------------------------------------------------
          */

        const hasCheckIn = Boolean(am.checkIn || pm.checkIn);

        /*
          |--------------------------------------------------------------------------
          | Calculate Actual Attendance Status
          |--------------------------------------------------------------------------
          */

        const calculatedStatus = calculateAttendanceStatus(workingMinutes, hasCheckIn);

        /*
          |--------------------------------------------------------------------------
          | FINAL COMMON STATUS
          |--------------------------------------------------------------------------
          |
          | IMPORTANT:
          |
          | If employee has actually logged in, actual working time
          | controls P / HD / SL.
          |
          | Example:
          |
          | Admin assigned P
          | Employee worked 6 minutes
          |
          | assignedStatus    = P
          | calculatedStatus  = SL
          |
          | FINAL STATUS      = SL
          |
          |--------------------------------------------------------------------------
          |
          | Protected admin statuses:
          |
          | WO / L / H / OD / WFH
          |
          | These remain unchanged even when attendance exists.
          |--------------------------------------------------------------------------
          */

        let status: AttendanceStatus;

        if (assignedStatus && PROTECTED_ROSTER_STATUSES.includes(assignedStatus)) {
          /*
            |--------------------------------------------------------------------------
            | Protected Admin Status
            |--------------------------------------------------------------------------
            */

          status = assignedStatus;
        } else if (calculatedStatus) {
          /*
            |--------------------------------------------------------------------------
            | Actual Working Time Status
            |--------------------------------------------------------------------------
            |
            | < 5h  = SL
            | 5-7h  = HD
            | 7h+   = P
            |--------------------------------------------------------------------------
            */

          status = calculatedStatus;
        } else {
          /*
            |--------------------------------------------------------------------------
            | No valid attendance calculation
            |--------------------------------------------------------------------------
            */

          status = assignedStatus || 'A';
        }

        /*
          |--------------------------------------------------------------------------
          | Build Attendance Day
          |--------------------------------------------------------------------------
          */

        employeeAttendance[dateKey] = {
          /*
            |--------------------------------------------------------------------------
            | SINGLE COMMON STATUS
            |--------------------------------------------------------------------------
            */

          status,

          /*
            |--------------------------------------------------------------------------
            | Current Login State
            |--------------------------------------------------------------------------
            */

          currentStatus,

          /*
            |--------------------------------------------------------------------------
            | Working / Break Time
            |--------------------------------------------------------------------------
            */

          workingMinutes,

          breakMinutes,

          /*
            |--------------------------------------------------------------------------
            | AM Session
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
            | PM Session
            |--------------------------------------------------------------------------
            */

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
