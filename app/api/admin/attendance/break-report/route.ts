import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import dayjs from 'dayjs';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';

import AttendanceLog from '@/models/attendance/AttendanceLog';
import User from '@/models/user/User';

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

    const date = searchParams.get('date') || '';

    /*
    |--------------------------------------------------------------------------
    | Date
    |--------------------------------------------------------------------------
    */

    const selectedDate = date ? dayjs(date) : dayjs();

    const startDate = selectedDate.startOf('day').toDate();

    const endDate = selectedDate.endOf('day').toDate();

    /*
    |--------------------------------------------------------------------------
    | Find Employees
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

      employeeIds = employees.map((employee) => employee._id.toString());

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
    | Attendance Logs
    |--------------------------------------------------------------------------
    |
    | We only need BREAK_IN and BREAK_OUT logs.
    |
    */

    const filter: Record<string, unknown> = {
      type: {
        $in: ['BREAK_IN', 'BREAK_OUT'],
      },

      dateTime: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (employeeIds.length > 0) {
      filter.employee = {
        $in: employeeIds,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Logs
    |--------------------------------------------------------------------------
    */

    const logs = await AttendanceLog.find(filter)
      .populate({
        path: 'employee',
        select: '_id employeeId name email department designation',
      })
      .sort({
        dateTime: 1,
      })
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Build Break Sessions
    |--------------------------------------------------------------------------
    */

    const breaks: any[] = [];

    const activeBreaks = new Map<string, any>();

    for (const log of logs) {
      const employeeId = log.employee?._id?.toString();

      if (!employeeId) {
        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | Session
      |--------------------------------------------------------------------------
      |
      | Before 12 PM = AM
      | 12 PM onward = PM
      |
      */

      const session = dayjs(log.dateTime).hour() < 12 ? 'AM' : 'PM';

      /*
      |--------------------------------------------------------------------------
      | BREAK IN
      |--------------------------------------------------------------------------
      */

      if (log.type === 'BREAK_IN') {
        const key = `${employeeId}-${log.attendance.toString()}`;

        activeBreaks.set(key, {
          key,

          attendanceId: log.attendance.toString(),

          employee: log.employee,

          session,

          breakIn: log.dateTime,

          breakOut: null,

          durationMinutes: 0,

          status: 'Active',
        });
      }

      /*
      |--------------------------------------------------------------------------
      | BREAK OUT
      |--------------------------------------------------------------------------
      */

      if (log.type === 'BREAK_OUT') {
        const key = `${employeeId}-${log.attendance.toString()}`;

        const activeBreak = activeBreaks.get(key);

        if (activeBreak) {
          const durationMinutes = Math.max(
            0,
            Math.floor((log.dateTime.getTime() - activeBreak.breakIn.getTime()) / 60000)
          );

          activeBreak.breakOut = log.dateTime;

          activeBreak.durationMinutes = durationMinutes;

          activeBreak.status = 'Completed';

          breaks.push(activeBreak);

          activeBreaks.delete(key);
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Add Active Breaks
    |--------------------------------------------------------------------------
    */

    for (const activeBreak of activeBreaks.values()) {
      const durationMinutes = Math.max(
        0,
        Math.floor((Date.now() - activeBreak.breakIn.getTime()) / 60000)
      );

      activeBreak.durationMinutes = durationMinutes;

      breaks.push(activeBreak);
    }

    /*
    |--------------------------------------------------------------------------
    | Format Response
    |--------------------------------------------------------------------------
    */

    const data = breaks.map((item) => ({
      key: `${item.attendanceId}-${item.breakIn.getTime()}`,

      employeeId: item.employee?.employeeId || '--',

      employeeName: item.employee?.name || '--',

      email: item.employee?.email || '--',

      session: item.session,

      breakIn: item.breakIn,

      breakOut: item.breakOut,

      durationMinutes: item.durationMinutes || 0,

      status: item.status,
    }));

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
    console.error('Break Report GET API Error:', error);

    return NextResponse.json(
      {
        success: false,

        message: error instanceof Error ? error.message : 'Failed to fetch break report.',
      },
      {
        status: 500,
      }
    );
  }
}
