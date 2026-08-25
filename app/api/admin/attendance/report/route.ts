import { NextRequest, NextResponse } from 'next/server';
import dayjs from 'dayjs';
import { cookies } from 'next/headers';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';

import Attendance from '@/models/attendance/Attendance';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // --------------------------------------------------
    // Authentication
    // --------------------------------------------------
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    verifyToken(token);

    // --------------------------------------------------
    // Query Params
    // --------------------------------------------------
    const { searchParams } = new URL(request.url);

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    const startDate = from
      ? dayjs(from).startOf('day').toDate()
      : dayjs().startOf('month').toDate();

    const endDate = to ? dayjs(to).endOf('day').toDate() : dayjs().endOf('month').toDate();

    // --------------------------------------------------
    // Attendance Query
    // --------------------------------------------------
    const query: any = {
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (employeeId) {
      query.employee = employeeId;
    }

    if (status) {
      query.status = status;
    }

    // --------------------------------------------------
    // Fetch Attendance + User
    // --------------------------------------------------
    const attendanceRecords = await Attendance.find(query)
      .populate({
        path: 'employee',
        select: 'name employeeId email',
      })
      .sort({
        date: 1,
      })
      .lean();

    // --------------------------------------------------
    // Group Employee-wise
    // --------------------------------------------------
    const employeeMap = new Map<string, any>();

    for (const record of attendanceRecords) {
      const employee = record.employee as any;

      if (!employee) {
        continue;
      }

      const id = String(employee._id);

      if (!employeeMap.has(id)) {
        employeeMap.set(id, {
          _id: id,

          employeeId: employee.employeeId || '-',

          employeeName:
            employee.name || employee.employeeId || employee.email || 'Unknown Employee',

          totalDays: 0,

          presentDays: 0,

          absentDays: 0,

          halfDays: 0,

          leaveDays: 0,

          holidayDays: 0,

          weeklyOffDays: 0,

          workingMinutes: 0,

          breakMinutes: 0,
        });
      }

      const item = employeeMap.get(id);

      // ----------------------------------------------
      // Count statuses
      // ----------------------------------------------
      switch (record.status) {
        case 'Present':
          item.presentDays += 1;
          break;

        case 'Absent':
          item.absentDays += 1;
          break;

        case 'Half Day':
          item.halfDays += 1;
          break;

        case 'Leave':
          item.leaveDays += 1;
          break;

        case 'Holiday':
          item.holidayDays += 1;
          break;

        case 'Weekly Off':
          item.weeklyOffDays += 1;
          break;
      }

      // ----------------------------------------------
      // Working days
      //
      // Holiday and Weekly Off are NOT working days.
      // ----------------------------------------------
      if (record.status !== 'Holiday' && record.status !== 'Weekly Off') {
        item.totalDays += 1;
      }

      item.workingMinutes += record.workingMinutes || 0;

      item.breakMinutes += record.breakMinutes || 0;
    }

    // --------------------------------------------------
    // Final Employee Report
    // --------------------------------------------------
    const report = Array.from(employeeMap.values()).map((item) => {
      const attendancePercentage =
        item.totalDays > 0 ? Number(((item.presentDays / item.totalDays) * 100).toFixed(2)) : 0;

      return {
        ...item,

        attendancePercentage,

        workingHours: Number((item.workingMinutes / 60).toFixed(2)),

        breakHours: Number((item.breakMinutes / 60).toFixed(2)),
      };
    });

    // --------------------------------------------------
    // Sort by Employee Name
    // --------------------------------------------------
    report.sort((a, b) => a.employeeName.localeCompare(b.employeeName));

    // --------------------------------------------------
    // Overall Summary
    // --------------------------------------------------
    const summary = report.reduce(
      (acc, item) => {
        acc.totalEmployees += 1;

        acc.totalDays += item.totalDays;

        acc.presentDays += item.presentDays;

        acc.absentDays += item.absentDays;

        acc.halfDays += item.halfDays;

        acc.leaveDays += item.leaveDays;

        acc.holidayDays += item.holidayDays;

        acc.weeklyOffDays += item.weeklyOffDays;

        acc.workingMinutes += item.workingMinutes;

        acc.breakMinutes += item.breakMinutes;

        return acc;
      },
      {
        totalEmployees: 0,

        totalDays: 0,

        presentDays: 0,

        absentDays: 0,

        halfDays: 0,

        leaveDays: 0,

        holidayDays: 0,

        weeklyOffDays: 0,

        workingMinutes: 0,

        breakMinutes: 0,
      }
    );

    summary.attendancePercentage =
      summary.totalDays > 0
        ? Number(((summary.presentDays / summary.totalDays) * 100).toFixed(2))
        : 0;

    // --------------------------------------------------
    // Response
    // --------------------------------------------------
    return NextResponse.json({
      success: true,

      filters: {
        from: dayjs(startDate).format('YYYY-MM-DD'),

        to: dayjs(endDate).format('YYYY-MM-DD'),

        employeeId: employeeId || null,

        status: status || null,
      },

      summary,

      data: report,
    });
  } catch (error: any) {
    console.error('Attendance MIS Report Error:', error);

    return NextResponse.json(
      {
        success: false,

        message: error?.message || 'Failed to generate attendance report',
      },
      {
        status: 500,
      }
    );
  }
}
