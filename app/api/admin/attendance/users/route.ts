import { NextRequest, NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongodb';
import User from '@/models/user/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const status = searchParams.get('status') || 'active';

    const filter: Record<string, unknown> = {
      // Never show admin users in attendance roster
      role: {
        $ne: 'admin',
      },
    };

    /*
     * Employee status
     */
    if (status) {
      filter.status = status;
    }

    /*
     * Department filter
     */
    if (department) {
      filter.department = department;
    }

    /*
     * Employee search
     */
    if (search) {
      filter.$or = [
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
        {
          phone: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    /*
     * Fetch employees
     */
    const employees = await User.find(filter)
      .select(
        '_id employeeId name email phone department designation avatar role status joiningDate'
      )
      .sort({
        employeeId: 1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error('Attendance Users API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch employees.',
      },
      {
        status: 500,
      }
    );
  }
}
