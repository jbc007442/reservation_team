import dayjs from 'dayjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';

import Attendance from '@/models/attendance/Attendance';
import AttendanceLog from '@/models/attendance/AttendanceLog';
import Leave from '@/models/attendance/Leave';
import User from '@/models/user/User';

type SessionName = 'am' | 'pm';

type Period = 'day' | 'week' | 'month';

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
|
| Examples:
|
| /api/admin/attendance/users/history
|
| /api/admin/attendance/users/history?period=day&date=2026-08-27
|
| /api/admin/attendance/users/history?period=week&date=2026-08-27
|
| /api/admin/attendance/users/history?period=month&date=2026-08-27
|
|--------------------------------------------------------------------------
*/

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
        {
          status: 401,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Token
    |--------------------------------------------------------------------------
    */

    const payload = verifyToken(token);

    /*
    |--------------------------------------------------------------------------
    | Find Logged In User
    |--------------------------------------------------------------------------
    */

    const user = await User.findById(payload.userId)
      .select('_id name employeeId email role status')
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found.',
        },
        {
          status: 401,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Active User
    |--------------------------------------------------------------------------
    */

    if (user.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          message: 'User account is inactive.',
        },
        {
          status: 403,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Query Parameters
    |--------------------------------------------------------------------------
    */

    const { searchParams } = new URL(req.url);

    const periodParam = searchParams.get('period') || 'month';

    const dateParam = searchParams.get('date');

    /*
    |--------------------------------------------------------------------------
    | Validate Period
    |--------------------------------------------------------------------------
    */

    const period: Period =
      periodParam === 'day' || periodParam === 'week' || periodParam === 'month'
        ? periodParam
        : 'month';

    /*
    |--------------------------------------------------------------------------
    | Selected Date
    |--------------------------------------------------------------------------
    */

    const selectedDate = dateParam ? dayjs(dateParam) : dayjs();

    if (!selectedDate.isValid()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid date.',
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate Date Range
    |--------------------------------------------------------------------------
    |
    | DAY
    | 00:00 -> 23:59
    |
    | WEEK
    | Sunday -> Saturday
    |
    | MONTH
    | First day -> Last day
    |
    |--------------------------------------------------------------------------
    */

    let startDate;
    let endDate;

    switch (period) {
      case 'day':
        startDate = selectedDate.startOf('day');
        endDate = selectedDate.endOf('day');
        break;

      case 'week':
        startDate = selectedDate.startOf('week');
        endDate = selectedDate.endOf('week');
        break;

      case 'month':
      default:
        startDate = selectedDate.startOf('month');
        endDate = selectedDate.endOf('month');
        break;
    }

    /*
    |--------------------------------------------------------------------------
    | Attendance Records
    |--------------------------------------------------------------------------
    */

    const attendanceRecords = await Attendance.find({
      employee: user._id,

      date: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      },
    })
      .sort({
        date: -1,
      })
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Approved Leaves
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | We count APPROVED LEAVE APPLICATIONS.
    |
    | Example:
    |
    | Leave A = 5 days
    | Leave B = 2 days
    |
    | Leaves card = 2
    |
    | NOT 7.
    |
    |--------------------------------------------------------------------------
    */

    const approvedLeaves = await Leave.find({
      employee: user._id,

      status: 'Approved',

      /*
      | Leave starts before selected range ends.
      */

      fromDate: {
        $lte: endDate.toDate(),
      },

      /*
      | Leave ends after selected range starts.
      */

      toDate: {
        $gte: startDate.toDate(),
      },
    })
      .select('_id leaveType fromDate toDate totalDays reason status')
      .sort({
        fromDate: 1,
      })
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Approved Leave Count
    |--------------------------------------------------------------------------
    */

    const leaveDays = approvedLeaves.length;

    /*
    |--------------------------------------------------------------------------
    | Attendance IDs
    |--------------------------------------------------------------------------
    */

    const attendanceIds = attendanceRecords.map((item) => item._id);

    /*
    |--------------------------------------------------------------------------
    | Attendance Logs
    |--------------------------------------------------------------------------
    |
    | Every login/logout/break is stored.
    |
    | IN
    | OUT
    | BREAK_IN
    | BREAK_OUT
    |
    |--------------------------------------------------------------------------
    */

    const logs =
      attendanceIds.length > 0
        ? await AttendanceLog.find({
            employee: user._id,

            attendance: {
              $in: attendanceIds,
            },

            dateTime: {
              $gte: startDate.toDate(),
              $lte: endDate.toDate(),
            },
          })
            .sort({
              dateTime: 1,
            })
            .lean()
        : [];

    /*
    |--------------------------------------------------------------------------
    | Group Logs By Attendance
    |--------------------------------------------------------------------------
    */

    const logsByAttendance = new Map<string, typeof logs>();

    for (const log of logs) {
      const attendanceId = log.attendance.toString();

      if (!logsByAttendance.has(attendanceId)) {
        logsByAttendance.set(attendanceId, []);
      }

      logsByAttendance.get(attendanceId)!.push(log);
    }

    /*
    |--------------------------------------------------------------------------
    | Determine AM / PM
    |--------------------------------------------------------------------------
    |
    | New logs:
    |
    | session: 'am'
    | session: 'pm'
    |
    | Older logs:
    |
    | Read AM / PM from remarks.
    |
    |--------------------------------------------------------------------------
    */

    const getLogSession = (log: any): SessionName | null => {
      /*
      |--------------------------------------------------------------------------
      | New Logs
      |--------------------------------------------------------------------------
      */

      if (log.session === 'am' || log.session === 'pm') {
        return log.session;
      }

      /*
      |--------------------------------------------------------------------------
      | Older Logs
      |--------------------------------------------------------------------------
      */

      const remarks = String(log.remarks || '').toLowerCase();

      if (remarks.includes('am')) {
        return 'am';
      }

      if (remarks.includes('pm')) {
        return 'pm';
      }

      /*
      |--------------------------------------------------------------------------
      | Fallback Based On Time
      |--------------------------------------------------------------------------
      */

      if (log.dateTime) {
        const hour = dayjs(log.dateTime).hour();

        return hour < 12 ? 'am' : 'pm';
      }

      return null;
    };

    /*
    |--------------------------------------------------------------------------
    | Calculate Session
    |--------------------------------------------------------------------------
    |
    | Supports:
    |
    | IN
    | OUT
    | IN
    | OUT
    |
    | BREAK_IN
    | BREAK_OUT
    | BREAK_IN
    | BREAK_OUT
    |
    |--------------------------------------------------------------------------
    */

    const calculateSession = (attendanceId: string, sessionName: SessionName) => {
      const allLogs = logsByAttendance.get(attendanceId) || [];

      /*
      |--------------------------------------------------------------------------
      | Only This Session
      |--------------------------------------------------------------------------
      */

      const sessionLogs = allLogs.filter((log: any) => getLogSession(log) === sessionName);

      /*
      |--------------------------------------------------------------------------
      | Totals
      |--------------------------------------------------------------------------
      */

      let totalElapsedMinutes = 0;

      let totalBreakMinutes = 0;

      /*
      |--------------------------------------------------------------------------
      | Current Login
      |--------------------------------------------------------------------------
      */

      let loginTime: Date | null = null;

      /*
      |--------------------------------------------------------------------------
      | Current Break
      |--------------------------------------------------------------------------
      */

      let breakStart: Date | null = null;

      /*
      |--------------------------------------------------------------------------
      | Process Logs
      |--------------------------------------------------------------------------
      */

      for (const log of sessionLogs) {
        const logTime = new Date(log.dateTime);

        /*
        |--------------------------------------------------------------------------
        | LOGIN
        |--------------------------------------------------------------------------
        */

        if (log.type === 'IN') {
          /*
          | Ignore duplicate IN while already logged in.
          */

          if (!loginTime) {
            loginTime = logTime;
          }

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | BREAK IN
        |--------------------------------------------------------------------------
        */

        if (log.type === 'BREAK_IN') {
          if (loginTime && !breakStart) {
            breakStart = logTime;
          }

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | BREAK OUT
        |--------------------------------------------------------------------------
        */

        if (log.type === 'BREAK_OUT') {
          if (breakStart) {
            const breakMinutes = Math.floor((logTime.getTime() - breakStart.getTime()) / 60000);

            totalBreakMinutes += Math.max(0, breakMinutes);

            breakStart = null;
          }

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | LOGOUT
        |--------------------------------------------------------------------------
        */

        if (log.type === 'OUT') {
          if (loginTime) {
            const elapsedMinutes = Math.floor((logTime.getTime() - loginTime.getTime()) / 60000);

            totalElapsedMinutes += Math.max(0, elapsedMinutes);

            loginTime = null;
          }

          /*
          |--------------------------------------------------------------------------
          | Safety:
          | Logout while break is active
          |--------------------------------------------------------------------------
          */

          if (breakStart) {
            const breakMinutes = Math.floor((logTime.getTime() - breakStart.getTime()) / 60000);

            totalBreakMinutes += Math.max(0, breakMinutes);

            breakStart = null;
          }

          continue;
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Current Working Session
      |--------------------------------------------------------------------------
      |
      | IN without OUT:
      |
      | IN -> NOW
      |
      |--------------------------------------------------------------------------
      */

      if (loginTime) {
        const now = new Date();

        const elapsedMinutes = Math.floor((now.getTime() - loginTime.getTime()) / 60000);

        totalElapsedMinutes += Math.max(0, elapsedMinutes);
      }

      /*
      |--------------------------------------------------------------------------
      | Current Break
      |--------------------------------------------------------------------------
      |
      | BREAK_IN without BREAK_OUT:
      |
      | BREAK_IN -> NOW
      |
      |--------------------------------------------------------------------------
      */

      if (breakStart) {
        const now = new Date();

        const breakMinutes = Math.floor((now.getTime() - breakStart.getTime()) / 60000);

        totalBreakMinutes += Math.max(0, breakMinutes);
      }

      /*
      |--------------------------------------------------------------------------
      | Actual Working Time
      |--------------------------------------------------------------------------
      |
      | Working:
      |
      | Total Login Time - Total Break Time
      |
      |--------------------------------------------------------------------------
      */

      const workingMinutes = Math.max(0, totalElapsedMinutes - totalBreakMinutes);

      /*
      |--------------------------------------------------------------------------
      | Current Status
      |--------------------------------------------------------------------------
      */

      const currentStatus = loginTime ? (breakStart ? 'On Break' : 'Working') : 'Checked Out';

      return {
        workingMinutes,

        breakMinutes: totalBreakMinutes,

        currentStatus,
      };
    };

    /*
    |--------------------------------------------------------------------------
    | Summary
    |--------------------------------------------------------------------------
    */

    let presentDays = 0;

    let totalWorkingMinutes = 0;

    let totalBreakMinutes = 0;

    /*
    |--------------------------------------------------------------------------
    | Format Attendance Data
    |--------------------------------------------------------------------------
    */

    const data = attendanceRecords.map((item: any) => {
      /*
        |--------------------------------------------------------------------------
        | Present Days
        |--------------------------------------------------------------------------
        */

      if (item.status === 'Present') {
        presentDays += 1;
      }

      /*
        |--------------------------------------------------------------------------
        | AM
        |--------------------------------------------------------------------------
        */

      const amCalculated = calculateSession(item._id.toString(), 'am');

      /*
        |--------------------------------------------------------------------------
        | PM
        |--------------------------------------------------------------------------
        */

      const pmCalculated = calculateSession(item._id.toString(), 'pm');

      /*
        |--------------------------------------------------------------------------
        | Daily Working Total
        |--------------------------------------------------------------------------
        */

      const dailyWorkingMinutes = amCalculated.workingMinutes + pmCalculated.workingMinutes;

      /*
        |--------------------------------------------------------------------------
        | Daily Break Total
        |--------------------------------------------------------------------------
        */

      const dailyBreakMinutes = amCalculated.breakMinutes + pmCalculated.breakMinutes;

      /*
        |--------------------------------------------------------------------------
        | Range Totals
        |--------------------------------------------------------------------------
        */

      totalWorkingMinutes += dailyWorkingMinutes;

      totalBreakMinutes += dailyBreakMinutes;

      /*
        |--------------------------------------------------------------------------
        | Original Logs
        |--------------------------------------------------------------------------
        */

      const dayLogs = logsByAttendance.get(item._id.toString()) || [];

      /*
        |--------------------------------------------------------------------------
        | Return Record
        |--------------------------------------------------------------------------
        */

      return {
        _id: item._id,

        date: item.date,

        status: item.status,

        /*
          |--------------------------------------------------------------------------
          | AM
          |--------------------------------------------------------------------------
          */

        am: {
          checkIn: item.am?.checkIn || null,

          checkOut: item.am?.checkOut || null,

          currentStatus: amCalculated.currentStatus,

          lastActivityAt: item.am?.lastActivityAt || null,

          workingMinutes: amCalculated.workingMinutes,

          breakMinutes: amCalculated.breakMinutes,

          autoLoggedOut: item.am?.autoLoggedOut || false,

          autoLogoutAt: item.am?.autoLogoutAt || null,
        },

        /*
          |--------------------------------------------------------------------------
          | PM
          |--------------------------------------------------------------------------
          */

        pm: {
          checkIn: item.pm?.checkIn || null,

          checkOut: item.pm?.checkOut || null,

          currentStatus: pmCalculated.currentStatus,

          lastActivityAt: item.pm?.lastActivityAt || null,

          workingMinutes: pmCalculated.workingMinutes,

          breakMinutes: pmCalculated.breakMinutes,

          autoLoggedOut: item.pm?.autoLoggedOut || false,

          autoLogoutAt: item.pm?.autoLogoutAt || null,
        },

        /*
          |--------------------------------------------------------------------------
          | Daily Totals
          |--------------------------------------------------------------------------
          */

        workingMinutes: dailyWorkingMinutes,

        breakMinutes: dailyBreakMinutes,

        /*
          |--------------------------------------------------------------------------
          | Logs
          |--------------------------------------------------------------------------
          */

        logs: dayLogs.map((log: any) => ({
          _id: log._id,

          dateTime: log.dateTime,

          type: log.type,

          session: getLogSession(log),

          source: log.source,

          remarks: log.remarks,
        })),
      };
    });

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,

      employee: {
        _id: user._id,

        name: user.name,

        employeeId: user.employeeId,

        email: user.email,
      },

      /*
      |--------------------------------------------------------------------------
      | Summary
      |--------------------------------------------------------------------------
      */

      summary: {
        /*
        | Number of attendance records marked Present.
        */

        presentDays,

        /*
        | Number of APPROVED LEAVE APPLICATIONS.
        |
        | Example:
        |
        | 2 approved leave records = 2
        */

        leaveDays,

        /*
        | Total working time.
        */

        totalWorkingMinutes,

        /*
        | Total break time.
        */

        totalBreakMinutes,
      },

      /*
      |--------------------------------------------------------------------------
      | Selected Period
      |--------------------------------------------------------------------------
      */

      period,

      /*
      |--------------------------------------------------------------------------
      | Selected Date
      |--------------------------------------------------------------------------
      */

      selectedDate: selectedDate.format('YYYY-MM-DD'),

      /*
      |--------------------------------------------------------------------------
      | Date Range
      |--------------------------------------------------------------------------
      */

      dateRange: {
        startDate: startDate.toISOString(),

        endDate: endDate.toISOString(),
      },

      /*
      |--------------------------------------------------------------------------
      | Approved Leave Records
      |--------------------------------------------------------------------------
      |
      | Included so frontend can optionally display
      | leave details later.
      |
      |--------------------------------------------------------------------------
      */

      approvedLeaves,

      /*
      |--------------------------------------------------------------------------
      | Attendance Data
      |--------------------------------------------------------------------------
      */

      data,
    });
  } catch (error) {
    console.error('Attendance History GET API Error:', error);

    return NextResponse.json(
      {
        success: false,

        message: error instanceof Error ? error.message : 'Failed to fetch attendance history.',
      },
      {
        status: 500,
      }
    );
  }
}