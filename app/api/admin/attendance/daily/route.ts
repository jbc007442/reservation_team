import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';

import Attendance from '@/models/attendance/Attendance';
import User from '@/models/user/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

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

    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.trim() || '';

    const status = searchParams.get('status') || '';

    const date = searchParams.get('date') || '';

    /*
     * Date range
     */
    const selectedDate = date ? new Date(date) : new Date();

    const startDate = new Date(selectedDate);

    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(selectedDate);

    endDate.setHours(23, 59, 59, 999);

    /*
     * Employee search
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
     * Attendance filter
     */
    const filter: Record<string, unknown> = {
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (status && status !== 'All') {
      if (status === 'Working') {
        filter.currentStatus = 'Working';
      } else if (status === 'On Break') {
        filter.currentStatus = 'On Break';
      } else if (status === 'Checked Out') {
        filter.currentStatus = 'Checked Out';
      } else {
        filter.status = status;
      }
    }

    if (employeeIds.length > 0) {
      filter.employee = {
        $in: employeeIds,
      };
    }

    /*
     * Fetch attendance
     */
    const attendance = await Attendance.find(filter)
      .populate({
        path: 'employee',
        select: '_id employeeId name email department designation avatar',
      })
      .sort({
        checkIn: 1,
      })
      .lean();

    /*
     * Format response
     */
    const data = attendance.map((item) => ({
      _id: item._id,

      employee: item.employee,

      checkIn: item.checkIn,

      checkOut: item.checkOut,

      workingMinutes: item.workingMinutes || 0,

      breakMinutes: item.breakMinutes || 0,

      currentStatus: item.currentStatus,

      status: item.status,

      date: item.date,
    }));

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
      { status: 500 }
    );
  }
}
